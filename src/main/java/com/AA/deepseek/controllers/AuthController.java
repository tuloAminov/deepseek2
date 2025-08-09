package com.AA.deepseek.controllers;

import com.AA.deepseek.dto.DeviceIdForm;
import com.AA.deepseek.services.UserService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/register")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping()
    public String showRegistrationForm(Model model) {
        model.addAttribute("deviceId", "");
        return "register";
    }

    @PostMapping()
    public String processRegistration(DeviceIdForm form, Model model) {
        if (form.getDeviceId() != null && !form.getDeviceId().isEmpty()) {
            userService.registerUser(form.getDeviceId());
        }
        return "redirect:/api/deepseek/ask";
    }
}