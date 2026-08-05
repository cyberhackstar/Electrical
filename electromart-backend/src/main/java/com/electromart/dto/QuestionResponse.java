package com.electromart.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionResponse {
    private Long id;
    private Long productId;
    private String askerName;
    private String questionText;
    private String answerText;
    private String answeredByName;
    private LocalDateTime createdAt;
    private LocalDateTime answeredAt;
}
