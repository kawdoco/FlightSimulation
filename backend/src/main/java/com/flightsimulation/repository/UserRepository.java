package com.flightsimulation.repository;
import com.flightsimulation.entity.ApplicationUser;
import org.springframework.data.jpa.repository.JpaRepository;
public interface UserRepository extends JpaRepository<ApplicationUser,String> {}
