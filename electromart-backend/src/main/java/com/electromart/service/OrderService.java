package com.electromart.service;

import com.electromart.dto.*;
import com.electromart.entity.*;
import com.electromart.exception.ApiException;
import com.electromart.repository.AddressRepository;
import com.electromart.repository.OrderRepository;
import com.electromart.repository.ProductRepository;
import com.electromart.util.AppConstants;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final AddressRepository addressRepository;
    private final ProductRepository productRepository;
    private final CartService cartService;
    private final CouponService couponService;
    private final RazorpayService razorpayService;
    private final EmailService emailService;

    private static final Set<OrderStatus> CANCELLABLE_STATUSES = Set.of(OrderStatus.PLACED, OrderStatus.CONFIRMED);

    // ---------- RAZORPAY CHECKOUT ----------

    @Transactional
    public RazorpayOrderResponse initiateRazorpayCheckout(User user, CheckoutRequest request) {
        com.electromart.entity.Order order = buildOrderFromCart(user, request, PaymentMethod.RAZORPAY);

        long amountInPaise = order.getTotalAmount()
                .multiply(BigDecimal.valueOf(100))
                .setScale(0, RoundingMode.HALF_UP)
                .longValueExact();

        com.razorpay.Order razorpayOrder = razorpayService.createOrder(amountInPaise, order.getOrderNumber());
        try {
            order.setRazorpayOrderId(razorpayOrder.get("id"));
        } catch (Exception e) {
            throw new ApiException("Failed to read Razorpay order response", HttpStatus.INTERNAL_SERVER_ERROR);
        }

        orderRepository.save(order);

        return RazorpayOrderResponse.builder()
                .internalOrderId(order.getId())
                .orderNumber(order.getOrderNumber())
                .razorpayOrderId(order.getRazorpayOrderId())
                .amountInPaise(amountInPaise)
                .currency("INR")
                .razorpayKeyId(razorpayService.getKeyId())
                .build();
    }

    @Transactional
    public OrderResponse verifyRazorpayPayment(User user, PaymentVerificationRequest request) {
        com.electromart.entity.Order order = orderRepository.findByRazorpayOrderId(request.getRazorpayOrderId())
                .orElseThrow(() -> new ApiException("Order not found for this payment", HttpStatus.NOT_FOUND));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new ApiException("You do not have access to this order", HttpStatus.FORBIDDEN);
        }

        boolean valid = razorpayService.verifyPaymentSignature(
                request.getRazorpayOrderId(), request.getRazorpayPaymentId(), request.getRazorpaySignature());

        if (!valid) {
            order.setPaymentStatus(PaymentStatus.FAILED);
            orderRepository.save(order);
            throw new ApiException("Payment verification failed. Please contact support if amount was deducted.",
                    HttpStatus.BAD_REQUEST);
        }

        if (order.getPaymentStatus() != PaymentStatus.PAID) {
            order.setPaymentStatus(PaymentStatus.PAID);
            order.setOrderStatus(OrderStatus.CONFIRMED);
            order.setRazorpayPaymentId(request.getRazorpayPaymentId());
            order.setRazorpaySignature(request.getRazorpaySignature());
            orderRepository.save(order);

            deductStock(order);
            cartService.clearCart(user);
            emailService.sendOrderConfirmationEmail(user.getEmail(), order.getOrderNumber(), user.getFullName());
        }

        return toResponse(order);
    }

    /**
     * Called by the Razorpay webhook handler as a reliability backstop to
     * client-side verification.
     */
    @Transactional
    public void markPaidFromWebhook(String razorpayOrderId, String razorpayPaymentId) {
        orderRepository.findByRazorpayOrderId(razorpayOrderId).ifPresent(order -> {
            if (order.getPaymentStatus() != PaymentStatus.PAID) {
                order.setPaymentStatus(PaymentStatus.PAID);
                order.setOrderStatus(OrderStatus.CONFIRMED);
                order.setRazorpayPaymentId(razorpayPaymentId);
                orderRepository.save(order);
                deductStock(order);
            }
        });
    }

    @Transactional
    public void markFailedFromWebhook(String razorpayOrderId) {
        orderRepository.findByRazorpayOrderId(razorpayOrderId).ifPresent(order -> {
            if (order.getPaymentStatus() == PaymentStatus.PENDING) {
                order.setPaymentStatus(PaymentStatus.FAILED);
                orderRepository.save(order);
            }
        });
    }

    // ---------- COD CHECKOUT ----------

    @Transactional
    public OrderResponse placeCodOrder(User user, CheckoutRequest request) {
        com.electromart.entity.Order order = buildOrderFromCart(user, request, PaymentMethod.COD);

        if (order.getTotalAmount().compareTo(AppConstants.COD_MAX_ORDER_VALUE) > 0) {
            throw new ApiException(
                    "Cash on Delivery is not available for orders above ₹" + AppConstants.COD_MAX_ORDER_VALUE,
                    HttpStatus.BAD_REQUEST);
        }

        order.setOrderStatus(OrderStatus.CONFIRMED);
        orderRepository.save(order);

        deductStock(order);
        cartService.clearCart(user);
        emailService.sendOrderConfirmationEmail(user.getEmail(), order.getOrderNumber(), user.getFullName());

        return toResponse(order);
    }

    // ---------- SHARED ORDER BUILDING ----------

    private com.electromart.entity.Order buildOrderFromCart(User user, CheckoutRequest request, PaymentMethod method) {
        CartResponse cart = cartService.getCart(user);
        if (cart.getItems().isEmpty()) {
            throw new ApiException("Your cart is empty", HttpStatus.BAD_REQUEST);
        }

        for (CartItemResponse item : cart.getItems()) {
            if (!item.isInStock()) {
                throw new ApiException("'" + item.getProductName() + "' does not have enough stock",
                        HttpStatus.BAD_REQUEST);
            }
        }

        Address address = addressRepository.findById(request.getAddressId())
                .orElseThrow(() -> new ApiException("Address not found", HttpStatus.NOT_FOUND));
        if (!address.getUser().getId().equals(user.getId())) {
            throw new ApiException("You do not have access to this address", HttpStatus.FORBIDDEN);
        }

        BigDecimal itemsTotal = cart.getSubtotal();

        BigDecimal discountAmount = BigDecimal.ZERO;
        String appliedCouponCode = null;
        if (request.getCouponCode() != null && !request.getCouponCode().isBlank()) {
            discountAmount = couponService.applyCouponAtCheckout(request.getCouponCode(), itemsTotal);
            appliedCouponCode = request.getCouponCode().toUpperCase();
        }

        BigDecimal afterDiscount = itemsTotal.subtract(discountAmount);

        BigDecimal shippingCharge = afterDiscount.compareTo(AppConstants.FREE_SHIPPING_THRESHOLD) >= 0
                ? BigDecimal.ZERO
                : AppConstants.SHIPPING_CHARGE;

        BigDecimal taxAmount = afterDiscount.multiply(AppConstants.TAX_RATE_PERCENT)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        BigDecimal totalAmount = afterDiscount.add(shippingCharge).add(taxAmount);

        com.electromart.entity.Order order = com.electromart.entity.Order.builder()
                .orderNumber(AppConstants.generateOrderNumber())
                .user(user)
                .shippingFullName(address.getFullName())
                .shippingPhone(address.getPhone())
                .shippingAddressLine1(address.getAddressLine1())
                .shippingAddressLine2(address.getAddressLine2())
                .shippingCity(address.getCity())
                .shippingState(address.getState())
                .shippingPincode(address.getPincode())
                .shippingCountry(address.getCountry())
                .itemsTotal(itemsTotal)
                .discountAmount(discountAmount)
                .shippingCharge(shippingCharge)
                .taxAmount(taxAmount)
                .totalAmount(totalAmount)
                .couponCode(appliedCouponCode)
                .paymentMethod(method)
                .paymentStatus(PaymentStatus.PENDING)
                .orderStatus(OrderStatus.PLACED)
                .build();

        List<OrderItem> orderItems = new ArrayList<>();
        for (CartItemResponse item : cart.getItems()) {
            orderItems.add(OrderItem.builder()
                    .order(order)
                    .product(productRepository.getReferenceById(item.getProductId()))
                    .productName(item.getProductName())
                    .productImageUrl(item.getProductImage())
                    .unitPrice(item.getPrice())
                    .quantity(item.getQuantity())
                    .subtotal(item.getSubtotal())
                    .build());
        }
        order.setItems(orderItems);

        return order;
    }

    private void deductStock(com.electromart.entity.Order order) {
        for (OrderItem item : order.getItems()) {
            Product product = productRepository.findById(item.getProduct().getId())
                    .orElseThrow(() -> new ApiException("Product not found", HttpStatus.NOT_FOUND));
            int newStock = product.getStockQuantity() - item.getQuantity();
            product.setStockQuantity(Math.max(newStock, 0));
            productRepository.save(product);
        }
    }

    private void restoreStock(com.electromart.entity.Order order) {
        for (OrderItem item : order.getItems()) {
            productRepository.findById(item.getProduct().getId()).ifPresent(product -> {
                product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
                productRepository.save(product);
            });
        }
    }

    // ---------- ORDER LIFECYCLE ----------

    @Transactional
    public OrderResponse cancelOrder(User user, Long orderId) {
        com.electromart.entity.Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ApiException("Order not found", HttpStatus.NOT_FOUND));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new ApiException("You do not have access to this order", HttpStatus.FORBIDDEN);
        }
        if (!CANCELLABLE_STATUSES.contains(order.getOrderStatus())) {
            throw new ApiException("This order can no longer be cancelled", HttpStatus.BAD_REQUEST);
        }

        order.setOrderStatus(OrderStatus.CANCELLED);
        if (order.getPaymentStatus() == PaymentStatus.PAID) {
            order.setPaymentStatus(PaymentStatus.REFUNDED); // trigger actual Razorpay refund API call here in
                                                            // production
        }
        orderRepository.save(order);
        restoreStock(order);

        return toResponse(order);
    }

    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, OrderStatus newStatus) {
        com.electromart.entity.Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ApiException("Order not found", HttpStatus.NOT_FOUND));
        order.setOrderStatus(newStatus);
        orderRepository.save(order);
        return toResponse(order);
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(User user, Long orderId) {
        com.electromart.entity.Order order = getOwnedOrEntity(user, orderId);
        return toResponse(order);
    }

    /**
     * Returns the raw Order entity (with access check) — used by InvoiceController
     * to build the PDF.
     */
    @Transactional(readOnly = true)
    public com.electromart.entity.Order getOwnedOrEntity(User user, Long orderId) {
        com.electromart.entity.Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ApiException("Order not found", HttpStatus.NOT_FOUND));

        boolean isOwner = order.getUser().getId().equals(user.getId());
        boolean isStaff = user.getRole() == Role.ROLE_ADMIN || user.getRole() == Role.ROLE_STAFF;
        if (!isOwner && !isStaff) {
            throw new ApiException("You do not have access to this order", HttpStatus.FORBIDDEN);
        }

        return order;
    }

    @Transactional(readOnly = true)
    public Page<OrderResponse> getMyOrders(User user, Pageable pageable) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<OrderResponse> getAllOrdersForAdmin(Pageable pageable) {
        return orderRepository.findAll(pageable).map(this::toResponse);
    }

    private OrderResponse toResponse(com.electromart.entity.Order order) {
        List<OrderItemResponse> items = order.getItems().stream()
                .map(i -> OrderItemResponse.builder()
                        .productId(i.getProduct().getId())
                        .productName(i.getProductName())
                        .productImageUrl(i.getProductImageUrl())
                        .unitPrice(i.getUnitPrice())
                        .quantity(i.getQuantity())
                        .subtotal(i.getSubtotal())
                        .build())
                .toList();

        return OrderResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .shippingFullName(order.getShippingFullName())
                .shippingPhone(order.getShippingPhone())
                .shippingAddressLine1(order.getShippingAddressLine1())
                .shippingAddressLine2(order.getShippingAddressLine2())
                .shippingCity(order.getShippingCity())
                .shippingState(order.getShippingState())
                .shippingPincode(order.getShippingPincode())
                .items(items)
                .itemsTotal(order.getItemsTotal())
                .discountAmount(order.getDiscountAmount())
                .shippingCharge(order.getShippingCharge())
                .taxAmount(order.getTaxAmount())
                .totalAmount(order.getTotalAmount())
                .couponCode(order.getCouponCode())
                .paymentMethod(order.getPaymentMethod())
                .paymentStatus(order.getPaymentStatus())
                .orderStatus(order.getOrderStatus())
                .createdAt(order.getCreatedAt())
                .build();
    }
}
