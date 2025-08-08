package com.AA.deepseek.controllers;

import com.AA.deepseek.dto.MessageDto;
import com.AA.deepseek.entities.ChatResponse;
import com.AA.deepseek.services.ChatService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chats")
public class ChatController {
    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping("/{chatId}/message")
    public ChatResponse addMessage(@PathVariable Long chatId, @RequestBody MessageDto dto) {
        return chatService.addMessage(chatId, dto.getQuestion(), dto.getAnswer());
    }

    @GetMapping("/{chatId}/history")
    public List<ChatResponse> getHistory(@PathVariable Long chatId) {
        return chatService.getChatHistory(chatId);
    }
}