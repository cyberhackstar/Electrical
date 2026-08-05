package com.electromart.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AnswerRequest {

    @NotBlank
    @Size(max = 1000)
    private String answerText;
}
