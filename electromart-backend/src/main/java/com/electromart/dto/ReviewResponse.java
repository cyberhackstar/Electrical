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
public class ReviewResponse {
    private Long id;
    private Long productId;
    private String reviewerName;
    private Integer rating;
    private String comment;
    private boolean verifiedPurchase;
    private LocalDateTime createdAt;
}
