package com.AA.deepseek.services;

import com.AA.deepseek.entities.Chat;
import com.AA.deepseek.entities.Message;
import com.AA.deepseek.repositories.MessageRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
@Transactional
public class MessageService {
    private final MessageRepository messageRepository;
    private final ChatService chatService;

    public MessageService(MessageRepository messageRepository, ChatService chatService) {
        this.messageRepository = messageRepository;
        this.chatService = chatService;
    }

    public Message createMessage(Long chatId, String question) {
        Chat chat = chatService.getChatWithMessages(chatId)
                .orElseThrow(() -> new EntityNotFoundException("Chat not found"));

        Message message = new Message();
        message.setQuestion(question);
        message.setAnswer("Это ответ"); // Временный ответ
        message.setChat(chat);

        return messageRepository.save(message);
    }

    public List<Message> getChatMessages(Long chatId) {
        return chatService.getChatWithMessages(chatId)
                .map(Chat::getMessages)
                .orElse(Collections.emptyList());
    }
}