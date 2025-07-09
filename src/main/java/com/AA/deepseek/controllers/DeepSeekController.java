package com.AA.deepseek.controllers;

import com.AA.deepseek.dto.DeepSeekResponse;
import com.AA.deepseek.services.DeepSeekService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequestMapping("/api/deepseek")
public class DeepSeekController {
    private final DeepSeekService deepSeekService;

    @Autowired
    public DeepSeekController(DeepSeekService deepSeekService) {
        this.deepSeekService = deepSeekService;
    }

    @GetMapping("/ask")
    public String ask() {
        return "index";
    }

    @PostMapping("/ask")
    public String answer(
            @RequestParam("question") String question,  // Получаем вопрос из формы
            Model model  // Передаём данные в шаблон
    ) {
        DeepSeekResponse response = deepSeekService.getAnswer(question);
        model.addAttribute("answer", response.getChoices().get(0).getMessage().getContent());
        return "answer-page";  // Имя шаблона (answer-page.html)
    }
}