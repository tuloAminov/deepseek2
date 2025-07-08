package com.AA.deepseek.controllers;

import com.AA.deepseek.services.DeepSeekService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/deepseek")
public class DeepSeekController {
    private final DeepSeekService deepSeekService;

    @Autowired
    public DeepSeekController(DeepSeekService deepSeekService) {
        this.deepSeekService = deepSeekService;
    }

    @GetMapping("/test")
    public String test () {
        return "test";
    }

    @PostMapping("/ask")
    public String askQuestion(@RequestBody String question) {
        return ResponseEntity.ok(deepSeekService.getAnswer(question)).toString();
    }
}