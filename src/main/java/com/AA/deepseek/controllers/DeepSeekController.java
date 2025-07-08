package com.AA.deepseek.controllers;

import com.AA.deepseek.services.DeepSeekService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping("/api/deepseek")
public class DeepSeekController {
    private final DeepSeekService deepSeekService;

    @Autowired
    public DeepSeekController(DeepSeekService deepSeekService) {
        this.deepSeekService = deepSeekService;
    }

    @GetMapping("/")
    public String index() {
        return "index";
    }

    @PostMapping("/ask")
    public String askQuestion(@RequestBody String question) {
        return deepSeekService.getAnswer(question).getChoices();
    }
}