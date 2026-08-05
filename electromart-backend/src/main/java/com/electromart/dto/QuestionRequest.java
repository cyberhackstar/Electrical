package com.electromart.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class QuestionRequest {

    @NotNull
    private Long productId;

    @NotBlank
    @Size(max = 500)
    private String questionText;
}
