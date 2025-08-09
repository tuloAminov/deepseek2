package com.AA.deepseek.services;

import com.AA.deepseek.entities.Chat;
import com.AA.deepseek.entities.ChatResponse;
import com.AA.deepseek.entities.User;
import com.AA.deepseek.repositories.ChatRepository;
import com.AA.deepseek.repositories.ChatResponseRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ChatService {
    private final ChatRepository chatRepository;
    private final ChatResponseRepository chatResponseRepository;

    public ChatService(ChatRepository chatRepository, ChatResponseRepository chatResponseRepository) {
        this.chatRepository = chatRepository;
        this.chatResponseRepository = chatResponseRepository;
    }

    public Chat createChat(Long userId, String title) {
        Chat chat = new Chat();
        chat.setUser(new User(userId));  // Достаточно только ID
        chat.setTitle(title);
        return chatRepository.save(chat);
    }

    public ChatResponse addMessage(Long chatId, String question, String answer) {
        ChatResponse response = new ChatResponse();
        response.setQuestion(question);
        response.setAnswer(answer);
        response.setChat(new Chat(chatId));  // Только ID чата
        return chatResponseRepository.save(response);
    }

    public List<Chat> getChats(Long userId) {
        return chatRepository.findByUserId(userId);
    }

    public List<ChatResponse> getChatHistory(Long chatId) {
        return chatResponseRepository.findByChatId(chatId);
    }
}