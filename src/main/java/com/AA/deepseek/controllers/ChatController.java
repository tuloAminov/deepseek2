package com.AA.deepseek.controllers;

import com.AA.deepseek.dto.ChatDto;
import com.AA.deepseek.dto.MessageDto;
import com.AA.deepseek.dto.MessageRequest;
import com.AA.deepseek.entities.Chat;
import com.AA.deepseek.entities.Message;
import com.AA.deepseek.services.MessageService;
import com.AA.deepseek.services.ChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chat")
public class ChatController {
    private final ChatService chatService;
    private final MessageService messageService;

    public ChatController(ChatService chatService, MessageService messageService) {
        this.chatService = chatService;
        this.messageService = messageService;
    }

    @GetMapping("/list")
    public ResponseEntity<List<ChatDto>> getUserChats(@RequestParam String deviceId) {
        List<Chat> chats = chatService.getUserChats(deviceId);
        List<ChatDto> chatDtos = chats.stream()
                .map(ChatDto::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(chatDtos);
    }

    @PostMapping("/create")
    public ResponseEntity<ChatDto> createChat(@RequestBody ChatDto request) {
        Chat chat = chatService.createNewChat(request.getDeviceId(), request.getTitle());
        return ResponseEntity.ok(ChatDto.fromEntity(chat));
    }

    @GetMapping("/{chatId}/messages")
    public ResponseEntity<List<MessageDto>> getChatMessages(@PathVariable Long chatId) {
        List<Message> messages = messageService.getChatMessages(chatId);
        List<MessageDto> messageDtos = messages.stream()
                .map(MessageDto::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(messageDtos);
    }

    @PostMapping("/{chatId}/send")
    public ResponseEntity<MessageDto> sendMessage(@PathVariable Long chatId,
                                                  @RequestBody MessageRequest request) {
        Message message = messageService.createMessage(chatId, request.getQuestion());
        return ResponseEntity.ok(MessageDto.fromEntity(message));
    }
}