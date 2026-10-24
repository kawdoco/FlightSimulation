package com.flightsimulation.config;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.beans.factory.annotation.Autowired;
import org.flywaydb.core.Flyway;
import com.flightsimulation.repository.UserRepository;
import static org.junit.jupiter.api.Assertions.*;
@SpringBootTest(properties={"APP_ADMIN_PASSWORD=TestOnlyPassword2026!","spring.datasource.url=jdbc:h2:mem:supabaseprofile;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE","spring.datasource.driver-class-name=org.h2.Driver","spring.datasource.username=sa","spring.datasource.password=","flightsimulation.serial.enabled=false","logging.level.root=WARN"})
@ActiveProfiles("supabase")
class SupabaseProfileTest {
 @Autowired Flyway flyway;
 @Autowired UserRepository users;
 @Test void migratesIsolatedSchemaAndValidatesJpa(){assertEquals("1",flyway.info().current().getVersion().toString());assertTrue(users.existsById("admin"));flyway.validate();}
}
