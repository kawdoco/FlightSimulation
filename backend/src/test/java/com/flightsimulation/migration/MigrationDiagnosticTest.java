package com.flightsimulation.migration;
import java.sql.SQLException;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
class MigrationDiagnosticTest {
 @Test void explainsAuthenticationWithoutLeakingMessage(){String diagnostic=H2ToSupabase.diagnose(new SQLException("sensitive-password", "28P01"));assertTrue(diagnostic.contains("authentication rejected"));assertFalse(diagnostic.contains("sensitive-password"));}
 @Test void explainsNestedConnectionFailure(){assertTrue(H2ToSupabase.diagnose(new RuntimeException(new SQLException("private host", "08006"))).contains("connection failed"));}
}
