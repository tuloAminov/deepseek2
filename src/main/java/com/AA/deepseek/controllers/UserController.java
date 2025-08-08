package com.AA.deepseek.controllers;

import com.AA.deepseek.repositories.UserRepo;
import com.AA.deepseek.services.UserService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private UserService userService;
    private UserRepo userRepository;

    public UserController(UserService userService, UserRepo userRepository) {
        this.userService = userService;
        this.userRepository = userRepository;
    }


}