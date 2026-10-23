package com.flightsimulation.config;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import com.flightsimulation.repository.*;
import com.flightsimulation.entity.*;
import static org.junit.jupiter.api.Assertions.*;
@SpringBootTest(properties={"APP_ADMIN_PASSWORD=TestOnlyPassword2026!","spring.datasource.url=jdbc:h2:mem:summarytest","spring.jpa.hibernate.ddl-auto=create-drop","flightsimulation.serial.enabled=false"})
@Transactional
class TelemetrySummaryTest {
 @Autowired com.flightsimulation.service.TelemetryService service;
 @Autowired TelemetryRepository telemetry;
 @Autowired AircraftRepository aircraft;
 @Autowired FlightRepository flights;
 private Flight flight(String number){
  Aircraft a=new Aircraft();a.setRegistrationNumber(number);a.setModel("Test");a.setManufacturer("Test");aircraft.save(a);
  Flight f=new Flight();f.setAircraft(a);f.setFlightNumber(number);f.setDeparture("A");f.setDestination("B");return flights.saveAndFlush(f);
 }
 private void sample(Flight flight,double altitude,double speed,double fuel){
  Telemetry t=new Telemetry();t.setFlight(flight);t.setAltitude(altitude);t.setSpeed(speed);t.setFuel(fuel);t.setPitch(0.0);t.setRoll(0.0);t.setHeading(0.0);t.setThrottle(0.0);telemetry.saveAndFlush(t);
 }
 @Test void aggregateIsScopedToFlight(){
  Flight f=flight("SUM-1"),other=flight("SUM-2");sample(f,100,20,80);sample(f,300,40,60);sample(other,9000,900,1);
  var s=telemetry.summarize(f.getId());assertEquals(2,s.getRecordCount());assertEquals(200,s.getAverageAltitude());assertEquals(300,s.getMaxAltitude());assertEquals(30,s.getAverageSpeed());assertEquals(40,s.getMaxSpeed());assertEquals(60,s.getMinimumFuel());
 }
 @Test void emptyFlightReturnsZeros(){var s=telemetry.summarize(flight("EMPTY").getId());assertEquals(0,s.getRecordCount());assertEquals(0,s.getAverageAltitude());assertEquals(0,s.getMinimumFuel());}
 @Test void historyPagesAreBoundedAndScoped(){
  Flight f=flight("PAGE-1"),other=flight("PAGE-2");sample(f,100,20,80);sample(f,200,30,70);sample(f,300,40,60);sample(other,999,999,1);
  var first=service.getHistory(f.getId(),0,2);var second=service.getHistory(f.getId(),1,2);
  assertEquals(2,first.content().size());assertTrue(first.hasNext());assertEquals(1,second.content().size());assertFalse(second.hasNext());
  var ids=new java.util.HashSet<Long>();first.content().forEach(t->ids.add(t.getId()));second.content().forEach(t->assertTrue(ids.add(t.getId())));assertEquals(3,ids.size());
 }
 @Test void historyRejectsExcessivePageSize(){assertThrows(IllegalArgumentException.class,()->service.getHistory(1L,0,201));assertThrows(IllegalArgumentException.class,()->service.getHistory(1L,-1,100));}
}
