package com.AA.deepseek.Client;

import com.AA.deepseek.dto.DeepSeekRequest;
import com.AA.deepseek.dto.DeepSeekResponse;
import com.AA.deepseek.dto.Message;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.List;

@Slf4j
@Service
public class DeepSeekClient {
    private final String apiKey = "";
    private final String apiUrl = "";
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public DeepSeekClient(RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    public String askQuestion(String userMessage) {
        DeepSeekRequest request = new DeepSeekRequest();
        request.setMessages(List.of(
                new Message("user", userMessage)
        ));

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + apiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<DeepSeekRequest> entity = new HttpEntity<>(request, headers);

        try {
            ResponseEntity<String> rawResponse = restTemplate.exchange(
                    apiUrl,
                    HttpMethod.POST,
                    entity,
                    String.class
            );

            DeepSeekResponse deepSeekResponse = objectMapper.readValue(rawResponse.getBody(), DeepSeekResponse.class);

            System.out.println("Ответ: " + deepSeekResponse.getId());
            System.out.println("Ответ: " + deepSeekResponse.getObject());
            System.out.println("Ответ: " + deepSeekResponse.getCreated());
            System.out.println("Ответ: " + deepSeekResponse.getChoices().get(0).getMessage().getContent());
            return deepSeekResponse.getChoices().get(0).getMessage().getContent();

        } catch (Exception e) {
            throw new RuntimeException("Failed to call DeepSeek API", e);
        }
    }
}