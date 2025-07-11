package com.AA.deepseek.controllers;

import com.AA.deepseek.dto.ChatMessage;
import com.AA.deepseek.dto.ChatResponse;
import com.AA.deepseek.dto.Question;
import com.AA.deepseek.services.DeepSeekService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@Controller
@RequestMapping("/api/deepseek")
public class DeepSeekController {
    private final DeepSeekService deepSeekService;
    private final List<ChatMessage> chatHistory = new ArrayList<>();

    @Autowired
    public DeepSeekController(DeepSeekService deepSeekService) {
        this.deepSeekService = deepSeekService;
    }

    @GetMapping("/ask")
    public String showAskForm(Model model) {
        model.addAttribute("question", new Question());
        model.addAttribute("chatHistory", chatHistory);
        return "ask-question";
    }

    @PostMapping(value = "/ask", consumes = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public ResponseEntity<ChatResponse> handleQuestion(@RequestBody Question question) {
        try {
            String answer = deepSeekService.getAnswer(question.getQuestion_text())
                    .getChoices().get(0).getMessage().getContent();

            ChatMessage chatMessage = new ChatMessage(question.getQuestion_text(), answer);
            chatHistory.add(chatMessage);

            return ResponseEntity.ok(new ChatResponse(question.getQuestion_text(), answer));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ChatResponse("", "Ошибка при обработке запроса: " + e.getMessage()));
        }
    }
}