package com.AA.deepseek.dto;

import java.util.List;

public class DeepSeekRequest {
    private String model = "deepseek-chat";
    private List<Message> messages;
    private boolean stream = false;

    public DeepSeekRequest() {
    }

    public DeepSeekRequest(List<Message> messages) {
        this.messages = messages;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public List<Message> getMessages() {
        return messages;
    }

    public void setMessages(List<Message> messages) {
        this.messages = messages;
    }

    public boolean isStream() {
        return stream;
    }

    public void setStream(boolean stream) {
        this.stream = stream;
    }
}