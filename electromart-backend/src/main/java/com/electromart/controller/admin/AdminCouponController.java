package com.electromart.controller.admin;

import com.electromart.dto.ApiResponse;
import com.electromart.dto.CouponRequest;
import com.electromart.dto.CouponResponse;
import com.electromart.service.CouponService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/coupons")
@RequiredArgsConstructor
public class AdminCouponController {

    private final CouponService couponService;

    @GetMapping
    public ApiResponse<List<CouponResponse>> getAll() {
        return ApiResponse.success("Coupons fetched", couponService.getAllForAdmin());
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CouponResponse>> create(@Valid @RequestBody CouponRequest request) {
        CouponResponse response = couponService.createCoupon(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Coupon created", response));
    }

    @PutMapping("/{id}")
    public ApiResponse<CouponResponse> update(@PathVariable Long id, @Valid @RequestBody CouponRequest request) {
        return ApiResponse.success("Coupon updated", couponService.updateCoupon(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Object> deactivate(@PathVariable Long id) {
        couponService.deactivateCoupon(id);
        return ApiResponse.success("Coupon deactivated", null);
    }
}
