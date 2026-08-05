package com.electromart.service;

import com.electromart.dto.ReviewRequest;
import com.electromart.dto.ReviewResponse;
import com.electromart.entity.*;
import com.electromart.exception.ApiException;
import com.electromart.repository.OrderRepository;
import com.electromart.repository.ProductRepository;
import com.electromart.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;

    @Transactional
    public ReviewResponse submitReview(User user, ReviewRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ApiException("Product not found", HttpStatus.NOT_FOUND));

        reviewRepository.findByProductIdAndUserId(product.getId(), user.getId())
                .ifPresent(r -> {
                    throw new ApiException("You have already reviewed this product", HttpStatus.CONFLICT);
                });

        boolean verifiedPurchase = hasDeliveredPurchase(user.getId(), product.getId());

        Review review = Review.builder()
                .product(product)
                .user(user)
                .rating(request.getRating())
                .comment(request.getComment())
                .verifiedPurchase(verifiedPurchase)
                .build();

        reviewRepository.save(review);
        recalculateProductRating(product);

        return toResponse(review);
    }

    @Transactional
    public void deleteReview(User user, Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ApiException("Review not found", HttpStatus.NOT_FOUND));

        boolean isOwner = review.getUser().getId().equals(user.getId());
        boolean isStaff = user.getRole() == Role.ROLE_ADMIN || user.getRole() == Role.ROLE_STAFF;
        if (!isOwner && !isStaff) {
            throw new ApiException("You do not have access to this review", HttpStatus.FORBIDDEN);
        }

        Product product = review.getProduct();
        reviewRepository.delete(review);
        recalculateProductRating(product);
    }

    public List<ReviewResponse> getProductReviews(Long productId) {
        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId)
                .stream().map(this::toResponse).toList();
    }

    private boolean hasDeliveredPurchase(Long userId, Long productId) {
        // A lightweight check: any of the user's orders containing this product that reached DELIVERED.
        // For larger catalogs, replace with a dedicated repository query; fine at this scale.
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId, org.springframework.data.domain.Pageable.unpaged())
                .stream()
                .filter(o -> o.getOrderStatus() == OrderStatus.DELIVERED)
                .flatMap(o -> o.getItems().stream())
                .anyMatch(item -> item.getProduct().getId().equals(productId));
    }

    private void recalculateProductRating(Product product) {
        Double avg = reviewRepository.findAverageRatingByProductId(product.getId());
        long count = reviewRepository.countByProductId(product.getId());
        product.setAvgRating(avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0);
        product.setRatingCount((int) count);
        productRepository.save(product);
    }

    private ReviewResponse toResponse(Review review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .productId(review.getProduct().getId())
                .reviewerName(review.getUser().getFullName())
                .rating(review.getRating())
                .comment(review.getComment())
                .verifiedPurchase(review.isVerifiedPurchase())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
