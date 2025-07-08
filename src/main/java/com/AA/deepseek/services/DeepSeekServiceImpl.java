package com.AA.deepseek.services;

import com.AA.deepseek.Client.DeepSeekClient;
import com.AA.deepseek.dto.DeepSeekResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class DeepSeekServiceImpl implements DeepSeekService {
    private final DeepSeekClient apiClient;

    @Autowired
    public DeepSeekServiceImpl(DeepSeekClient apiClient) {
        this.apiClient = apiClient;
    }

    @Override
    public DeepSeekResponse getAnswer(String userQuestion) {
        return apiClient.askQuestion(userQuestion);
    }
}