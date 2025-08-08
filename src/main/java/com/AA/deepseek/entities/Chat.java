package com.AA.deepseek.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Setter
@Getter
@Entity
@NoArgsConstructor
@Table(name = "chats")
public class Chat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;  // Например, "Чат от 2024-05-20"

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @OneToMany(mappedBy = "chat", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ChatResponse> messages = new ArrayList<>();

    public Chat(Long id) {
        this.id = id;
    }

    @Override
    public String toString() {
        return "Chat{" +
                "id=" + id +
                ", title='" + title + '\'' +
                ", user=" + user +
                ", messages=" + messages +
                '}';
    }
}