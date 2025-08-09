package com.AA.deepseek.services;

import com.AA.deepseek.entities.User;
import com.AA.deepseek.repositories.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public void registerUser(String deviceId) {
        if (!userRepository.existsByDeviceId(deviceId)) {
            User user = new User();
            user.setDeviceId(deviceId);
            userRepository.save(user);
        }
    }
}