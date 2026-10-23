package com.flightsimulation.service;
import org.springframework.stereotype.Service;
import javax.sql.DataSource;
import java.sql.SQLException;
@Service
public class ReadinessService {
 private final DataSource database;
 public ReadinessService(DataSource database){this.database=database;}
 public boolean databaseReady(){
  try(var connection=database.getConnection()) {return connection.isValid(2);}
  catch(SQLException ex){return false;}
 }
}
