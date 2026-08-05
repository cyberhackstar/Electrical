package com.electromart.controller;

import com.electromart.dto.ApiResponse;
import com.electromart.dto.OrderResponse;
import com.electromart.dto.PagedResponse;
import com.electromart.security.CustomUserDetails;
import com.electromart.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @GetMapping("/my")
    public ApiResponse<PagedResponse<OrderResponse>> getMyOrders(
            @AuthenticationPrincipal CustomUserDetails principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        PagedResponse<OrderResponse> result = PagedResponse.from(orderService.getMyOrders(principal.getUser(), pageable));
        return ApiResponse.success("Orders fetched", result);
    }

    @GetMapping("/{id}")
    public ApiResponse<OrderResponse> getOrderById(
            @AuthenticationPrincipal CustomUserDetails principal,
            @PathVariable Long id) {
        return ApiResponse.success("Order fetched", orderService.getOrderById(principal.getUser(), id));
    }

    @PostMapping("/{id}/cancel")
    public ApiResponse<OrderResponse> cancelOrder(
            @AuthenticationPrincipal CustomUserDetails principal,
            @PathVariable Long id) {
        return ApiResponse.success("Order cancelled", orderService.cancelOrder(principal.getUser(), id));
    }
}
