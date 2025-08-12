package com.AA.deepseek.dto;

import com.AA.deepseek.entities.Chat;
import lombok.*;

@Setter
@Getter
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatDto {
    private String deviceId;
    private String title;

    public static ChatDto fromEntity(Chat chat) {
        return new ChatDto(chat.getUser().getDeviceId(), chat.getTitle());
    }
}