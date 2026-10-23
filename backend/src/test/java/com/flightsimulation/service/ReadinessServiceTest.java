package com.flightsimulation.service;
import org.junit.jupiter.api.Test;
import javax.sql.DataSource;
import java.sql.*;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;
class ReadinessServiceTest {
 @Test void healthyConnectionIsClosed()throws Exception{var db=mock(DataSource.class);var c=mock(Connection.class);when(db.getConnection()).thenReturn(c);when(c.isValid(2)).thenReturn(true);assertTrue(new ReadinessService(db).databaseReady());verify(c).close();}
 @Test void invalidConnectionIsDown()throws Exception{var db=mock(DataSource.class);var c=mock(Connection.class);when(db.getConnection()).thenReturn(c);assertFalse(new ReadinessService(db).databaseReady());verify(c).close();}
 @Test void databaseExceptionIsSanitized()throws Exception{var db=mock(DataSource.class);when(db.getConnection()).thenThrow(new SQLException("private connection details"));assertFalse(new ReadinessService(db).databaseReady());}
}
