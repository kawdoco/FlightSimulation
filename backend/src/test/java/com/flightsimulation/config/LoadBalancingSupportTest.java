package com.flightsimulation.config;

import com.flightsimulation.controller.AvailabilityController;
import javax.sql.DataSource;
import org.junit.jupiter.api.Test;
import org.springframework.boot.availability.ApplicationAvailability;
import org.springframework.boot.availability.ReadinessState;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class LoadBalancingSupportTest {
    @Test void instanceIsLogicalAndDoesNotTrustClientHeader() throws Exception {
        var request=new MockHttpServletRequest(); request.addHeader("X-Backend-Instance","spoofed");
        var response=new MockHttpServletResponse();
        new InstanceHeaderFilter("backend-b").doFilter(request,response,(req,res)->{});
        assertEquals("backend-b",response.getHeader("X-Backend-Instance"));
        assertThrows(IllegalArgumentException.class,()->new InstanceHeaderFilter("host\r\nsecret"));
    }
    @Test void probeRejectsRemoteAndChecksReadinessAndDatabase() throws Exception {
        var database=mock(DataSource.class);var availability=mock(ApplicationAvailability.class);
        var probe=new AvailabilityController(database,availability);var request=new MockHttpServletRequest();
        request.setRemoteAddr("192.0.2.10");assertEquals(403,probe.available(request).getStatusCode().value());
        verifyNoInteractions(database);
        request.setRemoteAddr("127.0.0.1");
        when(availability.getReadinessState()).thenReturn(ReadinessState.REFUSING_TRAFFIC);
        assertEquals(503,probe.available(request).getStatusCode().value());
        when(availability.getReadinessState()).thenReturn(ReadinessState.ACCEPTING_TRAFFIC);
        var connection=mock(java.sql.Connection.class);var statement=mock(java.sql.Statement.class);
        when(database.getConnection()).thenReturn(connection);when(connection.createStatement()).thenReturn(statement);
        assertEquals(204,probe.available(request).getStatusCode().value());verify(statement).execute("SELECT 1");
        when(database.getConnection()).thenThrow(new java.sql.SQLException("private details"));
        assertEquals(503,probe.available(request).getStatusCode().value());
    }
}
