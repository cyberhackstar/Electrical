package com.electromart.dto;

import com.electromart.entity.OrderStatus;
import com.electromart.entity.PaymentMethod;
import com.electromart.entity.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {
    private Long id;
    private String orderNumber;
    private String shippingFullName;
    private String shippingPhone;
    private String shippingAddressLine1;
    private String shippingAddressLine2;
    private String shippingCity;
    private String shippingState;
    private String shippingPincode;
    private List<OrderItemResponse> items;
    private BigDecimal itemsTotal;
    private BigDecimal discountAmount;
    private BigDecimal shippingCharge;
    private BigDecimal taxAmount;
    private BigDecimal totalAmount;
    private String couponCode;
    private PaymentMethod paymentMethod;
    private PaymentStatus paymentStatus;
    private OrderStatus orderStatus;
    private LocalDateTime createdAt;
}
