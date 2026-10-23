package com.flightsimulation.service;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
class CsvTextTest {
 @Test void escapesQuotesCommasAndNewlines(){assertEquals("\"A,\"\"B\"\"\nC\"",TelemetryService.csvText("A,\"B\"\nC"));}
 @Test void neutralizesFormulaPrefixes(){for(String value:new String[]{"=SUM(A1)"," +1","-1","@SUM(A1)","\t=1"})assertTrue(TelemetryService.csvText(value).startsWith("\"'"));}
 @Test void handlesEmptyText(){assertEquals("\"\"",TelemetryService.csvText(null));assertEquals("\"ABC\"",TelemetryService.csvText("ABC"));}
}
