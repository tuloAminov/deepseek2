package com.AA.deepseek.repositories;

import com.AA.deepseek.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByDeviceId(String deviceId);

    @Query("SELECT u FROM User u LEFT JOIN FETCH u.chats WHERE u.deviceId = :deviceId")
    Optional<User> findByDeviceIdWithChats(String deviceId);
}