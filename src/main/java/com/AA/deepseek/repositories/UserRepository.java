package com.AA.deepseek.repositories;

import com.AA.deepseek.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByDeviceId(String deviceId);

    boolean existsByDeviceId(String deviceId);
}
