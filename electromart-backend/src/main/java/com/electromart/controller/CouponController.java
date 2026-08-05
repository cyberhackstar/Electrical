package com.electromart.controller;

import com.electromart.dto.ApiResponse;
import com.electromart.dto.CouponValidationResponse;
import com.electromart.security.CustomUserDetails;
import com.electromart.service.CartService;
import com.electromart.service.CouponService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/coupons")
@RequiredArgsConstructor
public class CouponController {

    private final CouponService couponService;
    private final CartService cartService;

    /** Lets the logged-in customer preview a coupon's discount against their current cart before checkout. */
    @GetMapping("/validate")
    public ApiResponse<CouponValidationResponse> validate(
            @AuthenticationPrincipal CustomUserDetails principal,
            @RequestParam String code) {
        var cart = cartService.getCart(principal.getUser());
        return ApiResponse.success("Coupon is valid", couponService.validateCoupon(code, cart.getSubtotal()));
    }
}
