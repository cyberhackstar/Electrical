package com.electromart.controller;

import com.electromart.dto.ApiResponse;
import com.electromart.dto.WishlistResponse;
import com.electromart.security.CustomUserDetails;
import com.electromart.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    @GetMapping
    public ApiResponse<List<WishlistResponse>> getMyWishlist(@AuthenticationPrincipal CustomUserDetails principal) {
        return ApiResponse.success("Wishlist fetched", wishlistService.getMyWishlist(principal.getUser()));
    }

    @PostMapping("/{productId}")
    public ResponseEntity<ApiResponse<WishlistResponse>> addToWishlist(
            @AuthenticationPrincipal CustomUserDetails principal,
            @PathVariable Long productId) {
        WishlistResponse response = wishlistService.addToWishlist(principal.getUser(), productId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Added to wishlist", response));
    }

    @DeleteMapping("/{productId}")
    public ApiResponse<Object> removeFromWishlist(
            @AuthenticationPrincipal CustomUserDetails principal,
            @PathVariable Long productId) {
        wishlistService.removeFromWishlist(principal.getUser(), productId);
        return ApiResponse.success("Removed from wishlist", null);
    }
}
