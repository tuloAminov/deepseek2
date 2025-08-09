package com.AA.deepseek.repositories;

import com.AA.deepseek.entities.ChatResponse;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatResponseRepository extends JpaRepository<ChatResponse, Long> {
    List<ChatResponse> findByChatId(Long chatId);
}