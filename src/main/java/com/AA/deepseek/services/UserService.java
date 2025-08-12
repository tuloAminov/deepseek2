package com.AA.deepseek.services;

import com.AA.deepseek.entities.User;
import com.AA.deepseek.repositories.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@Transactional
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User getOrCreateUserByDeviceId(String deviceId) {
        return userRepository.findByDeviceId(deviceId)
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setDeviceId(deviceId);
                    return userRepository.save(newUser);
                });
    }

    public Optional<User> getUserWithChats(String deviceId) {
        return userRepository.findByDeviceIdWithChats(deviceId);
    }
}