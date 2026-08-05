package com.electromart.controller;

import com.electromart.dto.ApiResponse;
import com.electromart.dto.CheckoutRequest;
import com.electromart.dto.OrderResponse;
import com.electromart.dto.RazorpayOrderResponse;
import com.electromart.security.CustomUserDetails;
import com.electromart.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/checkout")
@RequiredArgsConstructor
public class CheckoutController {

    private final OrderService orderService;

    /** Step 1 of the Razorpay flow: creates our internal Order (PENDING) + a Razorpay Order, returns details for the Checkout widget. */
    @PostMapping("/razorpay")
    public ApiResponse<RazorpayOrderResponse> initiateRazorpay(
            @AuthenticationPrincipal CustomUserDetails principal,
            @Valid @RequestBody CheckoutRequest request) {
        return ApiResponse.success("Razorpay order created", orderService.initiateRazorpayCheckout(principal.getUser(), request));
    }

    /** Places a COD order directly — confirmed immediately, no payment gateway involved. */
    @PostMapping("/cod")
    public ResponseEntity<ApiResponse<OrderResponse>> placeCodOrder(
            @AuthenticationPrincipal CustomUserDetails principal,
            @Valid @RequestBody CheckoutRequest request) {
        OrderResponse response = orderService.placeCodOrder(principal.getUser(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Order placed successfully", response));
    }
}
