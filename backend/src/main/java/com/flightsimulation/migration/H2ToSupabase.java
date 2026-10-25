package com.flightsimulation.migration;
import java.sql.*;
import java.util.*;
import org.flywaydb.core.Flyway;
/** Explicit one-time operator tool. Never starts as part of the web application. */
public final class H2ToSupabase {
 private static final List<String> TABLES=List.of("aircraft","flights","telemetry","alerts","iot_devices","maintenance_records","application_users","audit_records");
 public static void main(String[] args) {
  try { run(args); }
  catch(Exception failure) {
   System.err.println("Migration diagnostic (no credentials): " + diagnose(failure));
   System.exit(1);
  }
 }
 public static String diagnose(Throwable failure) {
  Throwable cause=failure;
  for(int depth=0;cause!=null && depth<20;depth++,cause=cause.getCause()) {
   if(cause instanceof SQLException sql) {
    String state=sql.getSQLState();
    if(state!=null && state.startsWith("28")) return "Database authentication rejected (SQLSTATE " + state + "). Check the database password and session-pooler username in Supabase Connect.";
    if(state!=null && state.startsWith("08")) return "Database connection failed (SQLSTATE " + state + "). Check the project status, host, TLS and network access.";
    if("42501".equals(state)) return "Insufficient database permissions (SQLSTATE 42501). Check schema/table privileges.";
    return "Database operation failed (SQLSTATE " + state + ", vendor code " + sql.getErrorCode() + "). Share this diagnostic; keep the source backup.";
   }
   if(cause instanceof java.net.UnknownHostException) return "Database hostname could not be resolved. Check the host from Supabase Connect.";
  }
  return "Migration stopped: " + failure.getClass().getSimpleName() + ". Share the diagnostic; do not reset or delete tables.";
 }
 private static void run(String[] args)throws Exception{
  String source=required("MIGRATION_H2_URL"),url=required("DB_URL"),user=required("DB_USERNAME"),password=required("DB_PASSWORD");
  if(!url.startsWith("jdbc:postgresql:")||!url.contains("sslmode="))throw new IllegalArgumentException("TLS PostgreSQL JDBC URL required");
  boolean apply=args.length==1&&args[0].equals("--apply");
  try(var from=DriverManager.getConnection(source,"sa","");var to=DriverManager.getConnection(url,user,password)){
   for(String table:TABLES)try(var statement=from.createStatement();var rows=statement.executeQuery("SELECT COUNT(*) FROM "+table)){rows.next();System.out.println(table+": source rows="+rows.getLong(1));}
   if(!apply){System.out.println("Preflight only. No destination changes. Run --apply after reviewing counts and backup.");return;}
   Flyway.configure().dataSource(url,user,password).schemas("flightsimulation").defaultSchema("flightsimulation").baselineOnMigrate(false).cleanDisabled(true).load().migrate();
   copy(from,to);
   System.out.println("Import committed. Application users and password hashes preserved; use existing login credentials.");
  }
 }
 private static String required(String name){String value=System.getenv(name);if(value==null||value.isBlank())throw new IllegalArgumentException("Missing environment variable: "+name);return value;}
 public static void copy(Connection source,Connection target)throws SQLException{
  target.setAutoCommit(false);
  try{
   // Serialize competing imports. The schema must not be used by a running application.
   boolean postgres=target.getMetaData().getDatabaseProductName().equals("PostgreSQL");
   if(postgres)try(var statement=target.createStatement()){statement.execute("SELECT pg_advisory_xact_lock(817340215)");}
   for(String table:TABLES)try(var statement=target.createStatement();var rows=statement.executeQuery("SELECT COUNT(*) FROM flightsimulation."+table)){
    rows.next();if(rows.getLong(1)!=0)throw new SQLException("Destination table is not empty: "+table+". Nothing imported.");
   }
   for(String table:TABLES){
    long copied=0;
    try(var statement=source.createStatement();var rows=statement.executeQuery("SELECT * FROM "+table)){
     var metadata=rows.getMetaData();int size=metadata.getColumnCount();var columns=new ArrayList<String>();
     for(int i=1;i<=size;i++)columns.add("\""+metadata.getColumnLabel(i).toLowerCase(Locale.ROOT)+"\"");
     String sql="INSERT INTO flightsimulation."+table+" ("+String.join(",",columns)+") VALUES ("+String.join(",",Collections.nCopies(size,"?"))+")";
     try(var insert=target.prepareStatement(sql)){
      while(rows.next()){
       for(int i=1;i<=size;i++)insert.setObject(i,rows.getObject(i));
       insert.addBatch();copied++;if(copied%500==0)insert.executeBatch();
      }
      insert.executeBatch();
     }
    }
    try(var statement=target.createStatement();var rows=statement.executeQuery("SELECT COUNT(*) FROM flightsimulation."+table)){
     rows.next();if(rows.getLong(1)!=copied)throw new SQLException("Count verification failed: "+table);
    }
    if(postgres&&!table.equals("application_users"))try(var statement=target.createStatement()){
     statement.execute("SELECT setval(pg_get_serial_sequence('flightsimulation."+table+"','id'), COALESCE((SELECT MAX(id) FROM flightsimulation."+table+"),1), EXISTS(SELECT 1 FROM flightsimulation."+table+"))");
    }
    System.out.println(table+": copied and verified rows="+copied);
   }
   target.commit();
  }catch(SQLException|RuntimeException ex){target.rollback();throw ex;}
 }
}

