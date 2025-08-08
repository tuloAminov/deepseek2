package com.AA.deepseek.repositories;

import com.AA.deepseek.entities.Chat;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatRepo extends JpaRepository<Chat, Long> {
    List<Chat> findByUserId(Long userId);
}