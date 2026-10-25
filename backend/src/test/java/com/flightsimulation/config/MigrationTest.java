package com.flightsimulation.config;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.flywaydb.core.Flyway;
import static org.junit.jupiter.api.Assertions.*;
@SpringBootTest(properties={"APP_ADMIN_PASSWORD=TestOnlyPassword2026!","spring.datasource.driver-class-name=${MIGRATION_TEST_DRIVER:org.h2.Driver}","spring.datasource.username=${MIGRATION_TEST_USERNAME:sa}","spring.datasource.password=${MIGRATION_TEST_PASSWORD:}","spring.datasource.url=${MIGRATION_TEST_URL:jdbc:h2:mem:migrations;MODE=PostgreSQL}","spring.flyway.enabled=true","spring.jpa.hibernate.ddl-auto=validate","flightsimulation.serial.enabled=false","spring.jpa.show-sql=false","logging.level.root=WARN"})
class MigrationTest {
 @Autowired Flyway flyway;
 @Test void migratesThenValidatesWithoutHibernateDdl(){assertEquals("2",flyway.info().current().getVersion().toString());assertEquals(0,flyway.info().pending().length);flyway.validate();assertEquals(0,flyway.migrate().migrationsExecuted);}
}

