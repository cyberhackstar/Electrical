package com.electromart.controller.admin;

import com.electromart.dto.ApiResponse;
import com.electromart.dto.OrderResponse;
import com.electromart.dto.OrderStatusUpdateRequest;
import com.electromart.dto.PagedResponse;
import com.electromart.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/orders")
@RequiredArgsConstructor
public class AdminOrderController {

    private final OrderService orderService;

    @GetMapping
    public ApiResponse<PagedResponse<OrderResponse>> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        PagedResponse<OrderResponse> result = PagedResponse.from(orderService.getAllOrdersForAdmin(pageable));
        return ApiResponse.success("Orders fetched", result);
    }

    @PutMapping("/{id}/status")
    public ApiResponse<OrderResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody OrderStatusUpdateRequest request) {
        return ApiResponse.success("Order status updated", orderService.updateOrderStatus(id, request.getOrderStatus()));
    }
}
