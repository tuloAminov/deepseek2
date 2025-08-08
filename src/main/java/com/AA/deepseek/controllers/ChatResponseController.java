package com.AA.deepseek.controllers;

import com.AA.deepseek.entities.Chat;
import com.AA.deepseek.entities.ChatResponse;
import com.AA.deepseek.repositories.ChatRepo;
import com.AA.deepseek.repositories.ChatResponseRepo;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/responses")
public class ChatResponseController {
    private final ChatResponseRepo responseRepository;
    private final ChatRepo chatRepository;

    public ChatResponseController(ChatResponseRepo responseRepository, ChatRepo chatRepository) {
        this.responseRepository = responseRepository;
        this.chatRepository = chatRepository;
    }

    // Добавить вопрос-ответ
    @PostMapping
    public ChatResponse addResponse(
            @RequestParam Long chatId,
            @RequestParam String question,
            @RequestParam String answer
    ) {
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new RuntimeException("Чат не найден"));

        ChatResponse response = new ChatResponse();
        response.setQuestion(question);
        response.setAnswer(answer);
        response.setChat(chat);
        return responseRepository.save(response);
    }

    // Получить историю вопросов-ответов
    @GetMapping
    public List<ChatResponse> getResponses(@RequestParam Long chatId) {
        return responseRepository.findByChatId(chatId);
    }
}