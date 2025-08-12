package com.AA.deepseek.dto;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Data
public class MessageRequest {
    private String question;
}