package com.flightsimulation.dto;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.*;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
class PageResponseTest {
 @Test void exposesStableMetadata(){var response=PageResponse.from(new PageImpl<>(List.of("a","b"),PageRequest.of(1,2),5));assertEquals(1,response.page());assertEquals(2,response.size());assertEquals(5,response.totalElements());assertEquals(3,response.totalPages());assertFalse(response.first());assertFalse(response.last());assertEquals(List.of("a","b"),response.content());}
 @Test void emptyPageIsLast(){var response=PageResponse.from(Page.<String>empty(PageRequest.of(0,50)));assertTrue(response.first());assertTrue(response.last());assertEquals(0,response.totalElements());assertEquals(List.of(),response.content());}
 @Test void contentIsImmutable(){var response=PageResponse.from(new PageImpl<>(List.of("a")));assertThrows(UnsupportedOperationException.class,()->response.content().add("b"));}
}
