package com.flightsimulation.migration;
import org.junit.jupiter.api.Test;
import org.flywaydb.core.Flyway;
import java.sql.*;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;
class H2ToSupabaseTest {
 @Test void copiesIdsUsersAndRejectsNonemptyTarget()throws Exception{
  String source="jdbc:h2:mem:source"+UUID.randomUUID()+";DB_CLOSE_DELAY=-1;DATABASE_TO_LOWER=TRUE";
  String target="jdbc:h2:mem:target"+UUID.randomUUID()+";DB_CLOSE_DELAY=-1;DATABASE_TO_LOWER=TRUE";
  Flyway.configure().dataSource(source,"sa","").load().migrate();
  Flyway.configure().dataSource(target,"sa","").schemas("flightsimulation").defaultSchema("flightsimulation").load().migrate();
  try(var from=DriverManager.getConnection(source,"sa","");var to=DriverManager.getConnection(target,"sa","")){
   try(var s=from.createStatement()){
    s.execute("INSERT INTO aircraft(id,registration_number,model,manufacturer,status) VALUES(10,'COPY-TEST','Model','Maker','AVAILABLE')");
    s.execute("INSERT INTO application_users(username,password_hash,role,enabled) VALUES('existing-user','test-hash','VIEWER',true)");
   }
   H2ToSupabase.copy(from,to);
   try(var s=to.createStatement();var rows=s.executeQuery("SELECT id FROM flightsimulation.aircraft")){assertTrue(rows.next());assertEquals(10,rows.getLong(1));}
   try(var s=to.createStatement();var rows=s.executeQuery("SELECT password_hash FROM flightsimulation.application_users")){assertTrue(rows.next());assertEquals("test-hash",rows.getString(1));}
   assertThrows(SQLException.class,()->H2ToSupabase.copy(from,to));
   try(var s=to.createStatement();var rows=s.executeQuery("SELECT COUNT(*) FROM flightsimulation.aircraft")){rows.next();assertEquals(1,rows.getInt(1));}
  }
 }
}
