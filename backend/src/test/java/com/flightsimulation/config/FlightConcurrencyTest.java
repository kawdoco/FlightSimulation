package com.flightsimulation.config;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.beans.factory.annotation.Autowired;
import com.flightsimulation.repository.*;
import com.flightsimulation.entity.*;
import com.flightsimulation.service.FlightService;
import java.util.concurrent.*;
import static org.junit.jupiter.api.Assertions.*;
@SpringBootTest(properties={"APP_ADMIN_PASSWORD=TestOnlyPassword2026!","spring.datasource.driver-class-name=${MIGRATION_TEST_DRIVER:org.h2.Driver}","spring.datasource.username=${MIGRATION_TEST_USERNAME:sa}","spring.datasource.password=${MIGRATION_TEST_PASSWORD:}","spring.datasource.url=${MIGRATION_TEST_URL:jdbc:h2:mem:concurrency}","spring.jpa.hibernate.ddl-auto=create-drop","flightsimulation.serial.enabled=false"})
class FlightConcurrencyTest {
 @Autowired AuditRepository audit;
 @Autowired AircraftRepository aircraft;
 @Autowired FlightRepository flights;
 @Autowired FlightService service;
 @Test void twoFlightsCannotStartOnSameAircraft() throws Exception {
  Aircraft a=new Aircraft();a.setRegistrationNumber("CONCURRENT-1");a.setModel("Test");a.setManufacturer("Test");a=aircraft.saveAndFlush(a);
  Flight first=create(a,"CON-1"),second=create(a,"CON-2");
  var ready=new CountDownLatch(2);var go=new CountDownLatch(1);
  try(var pool=Executors.newFixedThreadPool(2)){
   Future<Boolean> one=pool.submit(()->start(first.getId(),ready,go));
   Future<Boolean> two=pool.submit(()->start(second.getId(),ready,go));
   assertTrue(ready.await(10,TimeUnit.SECONDS));go.countDown();
   int successes=(one.get(15,TimeUnit.SECONDS)?1:0)+(two.get(15,TimeUnit.SECONDS)?1:0);
   assertEquals(1,successes);
   assertEquals(1,audit.findAll().stream().filter(r->r.getAction().equals("FLIGHT_STARTED")).count());
   assertEquals(1,flights.findAll().stream().filter(f->"IN_PROGRESS".equals(f.getStatus())).count());
   assertEquals("IN_FLIGHT",aircraft.findById(a.getId()).orElseThrow().getStatus());
  }
 }
 private Flight create(Aircraft a,String number){Flight f=new Flight();f.setAircraft(a);f.setFlightNumber(number);f.setDeparture("A");f.setDestination("B");return flights.saveAndFlush(f);}
 private boolean start(Long id,CountDownLatch ready,CountDownLatch go)throws Exception {
  ready.countDown();if(!go.await(10,TimeUnit.SECONDS))throw new TimeoutException();
  try{service.startFlight(id);return true;}catch(org.springframework.orm.ObjectOptimisticLockingFailureException|IllegalStateException expected){return false;}
 }
}


