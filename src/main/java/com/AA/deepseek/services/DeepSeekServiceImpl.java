package com.AA.deepseek.services;

import com.AA.deepseek.Client.DeepSeekClient;
import com.AA.deepseek.dto.Choice;
import com.AA.deepseek.dto.DeepSeekResponse;
import com.AA.deepseek.dto.Message;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class DeepSeekServiceImpl implements DeepSeekService {
    private final DeepSeekClient apiClient;

    @Autowired
    public DeepSeekServiceImpl(DeepSeekClient apiClient) {
        this.apiClient = apiClient;
    }

    @Override
    public DeepSeekResponse getAnswer(String userQuestion) {
        if (userQuestion.equals("456789"))
            return apiClient.askQuestion(userQuestion);

        DeepSeekResponse deepSeekResponse = new DeepSeekResponse();
        deepSeekResponse.setId("55");
        deepSeekResponse.setObject("def");
        deepSeekResponse.setCreated(4545);
        List<Choice> choices = new ArrayList<>();
        Choice choice = new Choice();
        choice.setIndex(5555);
        choice.setMessage(new Message("admin", "это поле content"));
        choices.add(choice);
        deepSeekResponse.setChoices(choices);

        return deepSeekResponse;
    }
}