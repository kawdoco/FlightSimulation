package com.flightsimulation.config;
import org.springframework.context.annotation.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.http.HttpMethod;
@Configuration
public class SecurityConfig {
 @Bean public org.springframework.boot.ApplicationRunner bootstrapAdmin(com.flightsimulation.service.AccountService accounts,@Value("${APP_ADMIN_PASSWORD:}") String password){
  return args -> accounts.bootstrap(password);
 } @Bean public org.springframework.security.crypto.password.PasswordEncoder passwordEncoder(){return new BCryptPasswordEncoder();}
 @Bean public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
  http.cors(org.springframework.security.config.Customizer.withDefaults())
   .csrf(csrf->csrf.disable())
   .sessionManagement(s->s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
   .authorizeHttpRequests(a->a.dispatcherTypeMatchers(jakarta.servlet.DispatcherType.ASYNC).permitAll().requestMatchers("/ws","/ws/**").permitAll()
    .requestMatchers(HttpMethod.GET,"/internal/available").permitAll()
    .requestMatchers(HttpMethod.OPTIONS,"/**").permitAll()
    .requestMatchers("/api/operations/**").hasRole("ADMIN").requestMatchers("/api/users/**").hasRole("ADMIN").requestMatchers("/api/auth/**").authenticated().requestMatchers(HttpMethod.GET,"/api/**").hasAnyRole("VIEWER","OPERATOR","ADMIN")
    .requestMatchers(HttpMethod.DELETE,"/api/**").hasRole("ADMIN")
    .requestMatchers("/api/**").hasAnyRole("OPERATOR","ADMIN")
    .anyRequest().denyAll())
   .httpBasic(basic -> basic.authenticationEntryPoint((request,response,exception) -> {
     response.setStatus(401);
     response.setContentType("application/json");
     response.setCharacterEncoding("UTF-8");
     response.setHeader("Cache-Control","no-store");
     response.getWriter().write("{\"error\":\"Authentication required. Please sign in.\"}");
   }))
   .exceptionHandling(errors -> errors
    .authenticationEntryPoint((request,response,exception) -> {
     response.setStatus(401);response.setContentType("application/json");response.setCharacterEncoding("UTF-8");
     response.setHeader("Cache-Control","no-store");
     response.getWriter().write("{\"error\":\"Authentication required. Please sign in.\"}");
    })
    .accessDeniedHandler((request,response,exception) -> {
     response.setStatus(403);response.setContentType("application/json");response.setCharacterEncoding("UTF-8");
     response.setHeader("Cache-Control","no-store");
     response.getWriter().write("{\"error\":\"You do not have permission to perform this action.\"}");
    }));
  return http.build();
 }
}





