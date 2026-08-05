package com.electromart.controller;

import com.electromart.dto.ApiResponse;
import com.electromart.dto.QuestionRequest;
import com.electromart.dto.QuestionResponse;
import com.electromart.security.CustomUserDetails;
import com.electromart.service.ProductQAService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/questions")
@RequiredArgsConstructor
public class ProductQAController {

    private final ProductQAService productQAService;

    @GetMapping("/product/{productId}")
    public ApiResponse<List<QuestionResponse>> getQuestionsForProduct(@PathVariable Long productId) {
        return ApiResponse.success("Questions fetched", productQAService.getQuestionsForProduct(productId));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<QuestionResponse>> askQuestion(
            @AuthenticationPrincipal CustomUserDetails principal,
            @Valid @RequestBody QuestionRequest request) {
        QuestionResponse response = productQAService.askQuestion(principal.getUser(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Question submitted", response));
    }
}
