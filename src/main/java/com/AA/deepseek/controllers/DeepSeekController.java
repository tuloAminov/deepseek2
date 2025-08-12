package com.AA.deepseek.controllers;

import com.AA.deepseek.entities.Message;
import com.AA.deepseek.dto.Question;
import com.AA.deepseek.entities.User;
import com.AA.deepseek.services.ChatService;
import com.AA.deepseek.services.DeepSeekService;
import com.AA.deepseek.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Controller
@RequestMapping("/api/deepseek")
public class DeepSeekController {
    private final DeepSeekService deepSeekService;
    private final ChatService chatService;
    private final UserService userService;
    private final List<Message> chatHistory = new ArrayList<>();

    @Autowired
    public DeepSeekController(DeepSeekService deepSeekService, ChatService chatService, UserService userService) {
        this.deepSeekService = deepSeekService;
        this.chatService = chatService;
        this.userService = userService;
    }

    @GetMapping("/ask")
    public String showAskForm(@RequestParam(required = false) String deviceId, Model model) {
        if (deviceId == null || deviceId.isEmpty()) {
            return "redirect:/register";
        }

        // Проверяем, существует ли пользователь с таким deviceId
        Optional<User> user = userService.getUserWithChats(deviceId);
        if (user.isEmpty()) {
            return "redirect:/register";
        }

        model.addAttribute("deviceId", deviceId);
        return "ask-question";
    }

    /*@PostMapping(value = "/ask", consumes = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public ResponseEntity<ChatResponse> handleQuestion(@RequestBody Question question) {
        try {
            String answer = deepSeekService.getAnswer(question.getQuestion_text());

            chatHistory.add(new ChatResponse(question.getQuestion_text(), answer));

            return ResponseEntity.ok(new ChatResponse(question.getQuestion_text(), answer));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ChatResponse("", "Ошибка при обработке запроса: " + e.getMessage()));
        }
    }*/
}