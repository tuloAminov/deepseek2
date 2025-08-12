package com.AA.deepseek.services;

import com.AA.deepseek.entities.Chat;
import com.AA.deepseek.entities.User;
import com.AA.deepseek.repositories.ChatRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ChatService {
    private final ChatRepository chatRepository;
    private final UserService userService;

    public ChatService(ChatRepository chatRepository, UserService userService) {
        this.chatRepository = chatRepository;
        this.userService = userService;
    }

    public Chat createNewChat(String deviceId, String title) {
        User user = userService.getOrCreateUserByDeviceId(deviceId);

        Chat chat = new Chat();
        chat.setTitle(title);
        chat.setUser(user);

        return chatRepository.save(chat);
    }

    public List<Chat> getUserChats(String deviceId) {
        Optional<User> user = userService.getUserWithChats(deviceId);
        return user.map(User::getChats)
                .orElse(Collections.emptyList());
    }

    public Optional<Chat> getChatWithMessages(Long chatId) {
        return chatRepository.findByIdWithMessages(chatId);
    }
}