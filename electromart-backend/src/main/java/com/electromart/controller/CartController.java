package com.electromart.controller;

import com.electromart.dto.ApiResponse;
import com.electromart.dto.CartItemRequest;
import com.electromart.dto.CartResponse;
import com.electromart.security.CustomUserDetails;
import com.electromart.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ApiResponse<CartResponse> getCart(@AuthenticationPrincipal CustomUserDetails principal) {
        return ApiResponse.success("Cart fetched", cartService.getCart(principal.getUser()));
    }

    @PostMapping("/items")
    public ApiResponse<CartResponse> addItem(
            @AuthenticationPrincipal CustomUserDetails principal,
            @Valid @RequestBody CartItemRequest request) {
        return ApiResponse.success("Item added to cart", cartService.addItem(principal.getUser(), request));
    }

    @PutMapping("/items/{itemId}")
    public ApiResponse<CartResponse> updateItem(
            @AuthenticationPrincipal CustomUserDetails principal,
            @PathVariable Long itemId,
            @RequestParam int quantity) {
        return ApiResponse.success("Cart updated", cartService.updateItemQuantity(principal.getUser(), itemId, quantity));
    }

    @DeleteMapping("/items/{itemId}")
    public ApiResponse<CartResponse> removeItem(
            @AuthenticationPrincipal CustomUserDetails principal,
            @PathVariable Long itemId) {
        return ApiResponse.success("Item removed from cart", cartService.removeItem(principal.getUser(), itemId));
    }

    @DeleteMapping
    public ApiResponse<Object> clearCart(@AuthenticationPrincipal CustomUserDetails principal) {
        cartService.clearCart(principal.getUser());
        return ApiResponse.success("Cart cleared", null);
    }
}
