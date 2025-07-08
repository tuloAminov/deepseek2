package com.AA.deepseek.services;

import com.AA.deepseek.dto.DeepSeekResponse;

public interface DeepSeekService {
    DeepSeekResponse getAnswer(String question);
}