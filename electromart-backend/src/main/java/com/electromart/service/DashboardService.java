package com.electromart.service;

import com.electromart.dto.*;
import com.electromart.entity.OrderStatus;
import com.electromart.entity.PaymentStatus;
import com.electromart.entity.Product;
import com.electromart.entity.Role;
import com.electromart.repository.OrderRepository;
import com.electromart.repository.ProductRepository;
import com.electromart.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    private static final int LOW_STOCK_THRESHOLD = 10;

    public DashboardStatsResponse getStats() {
        var totalRevenue = orderRepository.sumTotalAmountByPaymentStatus(PaymentStatus.PAID);
        long totalOrders = orderRepository.count();
        long pendingOrders = orderRepository.countByOrderStatus(OrderStatus.PLACED);
        long totalCustomers = userRepository.countByRole(Role.ROLE_CUSTOMER);

        List<OrderResponse> recentOrders = orderRepository.findTop5ByOrderByCreatedAtDesc()
                .stream().map(this::toOrderResponse).toList();

        List<TopProductResponse> topProducts = orderRepository.findTopSellingProducts(PageRequest.of(0, 5))
                .stream()
                .map(row -> TopProductResponse.builder()
                        .productId((Long) row[0])
                        .productName((String) row[1])
                        .unitsSold((Long) row[2])
                        .build())
                .toList();

        List<LowStockProductResponse> lowStock = productRepository.findLowStockProducts(LOW_STOCK_THRESHOLD)
                .stream()
                .map(this::toLowStockResponse)
                .toList();

        return DashboardStatsResponse.builder()
                .totalRevenue(totalRevenue)
                .totalOrders(totalOrders)
                .pendingOrders(pendingOrders)
                .totalCustomers(totalCustomers)
                .recentOrders(recentOrders)
                .topSellingProducts(topProducts)
                .lowStockProducts(lowStock)
                .build();
    }

    private OrderResponse toOrderResponse(com.electromart.entity.Order order) {
        return OrderResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .totalAmount(order.getTotalAmount())
                .paymentMethod(order.getPaymentMethod())
                .paymentStatus(order.getPaymentStatus())
                .orderStatus(order.getOrderStatus())
                .createdAt(order.getCreatedAt())
                .build();
    }

    private LowStockProductResponse toLowStockResponse(Product product) {
        return LowStockProductResponse.builder()
                .productId(product.getId())
                .productName(product.getName())
                .sku(product.getSku())
                .stockQuantity(product.getStockQuantity())
                .build();
    }
}
