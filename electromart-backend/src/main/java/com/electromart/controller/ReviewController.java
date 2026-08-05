package com.electromart.controller;

import com.electromart.dto.ApiResponse;
import com.electromart.dto.ReviewRequest;
import com.electromart.dto.ReviewResponse;
import com.electromart.security.CustomUserDetails;
import com.electromart.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping("/product/{productId}")
    public ApiResponse<List<ReviewResponse>> getProductReviews(@PathVariable Long productId) {
        return ApiResponse.success("Reviews fetched", reviewService.getProductReviews(productId));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ReviewResponse>> submitReview(
            @AuthenticationPrincipal CustomUserDetails principal,
            @Valid @RequestBody ReviewRequest request) {
        ReviewResponse response = reviewService.submitReview(principal.getUser(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Review submitted", response));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Object> deleteReview(@AuthenticationPrincipal CustomUserDetails principal, @PathVariable Long id) {
        reviewService.deleteReview(principal.getUser(), id);
        return ApiResponse.success("Review deleted", null);
    }
}
