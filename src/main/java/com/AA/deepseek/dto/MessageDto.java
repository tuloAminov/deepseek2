package com.AA.deepseek.dto;

import com.AA.deepseek.entities.Message;
import lombok.*;

@Setter
@Getter
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MessageDto {
    private Long id;
    private String question;
    private String answer;

    public static MessageDto fromEntity(Message message) {
        return new MessageDto(message.getId(), message.getQuestion(), message.getAnswer());
    }
}