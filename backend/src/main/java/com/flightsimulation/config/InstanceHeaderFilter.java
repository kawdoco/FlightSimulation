package com.flightsimulation.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/** Logical deployment label only; never publish machine names or addresses. */
@Component
@Order(org.springframework.core.Ordered.HIGHEST_PRECEDENCE)
public class InstanceHeaderFilter extends OncePerRequestFilter {
    private final String instance;
    public InstanceHeaderFilter(@Value("${app.instance-id:single}") String instance) {
        if (!instance.matches("[A-Za-z0-9_-]{1,40}")) throw new IllegalArgumentException("Invalid app.instance-id");
        this.instance = instance;
    }
    @Override protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
            FilterChain chain) throws ServletException, IOException {
        response.setHeader("X-Backend-Instance", instance);
        chain.doFilter(request, response);
    }
}
