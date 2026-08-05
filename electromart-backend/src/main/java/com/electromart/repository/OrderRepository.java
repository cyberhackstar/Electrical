package com.electromart.repository;

import com.electromart.entity.Order;
import com.electromart.entity.OrderStatus;
import com.electromart.entity.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    @EntityGraph(attributePaths = { "items", "user" })
    @Override
    Optional<Order> findById(Long id);

    @EntityGraph(attributePaths = { "items", "user" })
    Optional<Order> findByOrderNumber(String orderNumber);

    @EntityGraph(attributePaths = { "items", "user" })
    Optional<Order> findByRazorpayOrderId(String razorpayOrderId);

    @EntityGraph(attributePaths = { "items", "user" })
    Page<Order> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    @EntityGraph(attributePaths = { "items", "user" })
    @Override
    Page<Order> findAll(Pageable pageable);

    long countByOrderStatus(OrderStatus orderStatus);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.paymentStatus = :paymentStatus")
    BigDecimal sumTotalAmountByPaymentStatus(@Param("paymentStatus") PaymentStatus paymentStatus);

    @EntityGraph(attributePaths = { "items", "user" })
    List<Order> findTop5ByOrderByCreatedAtDesc();

    @Query("""
            SELECT oi.product.id, oi.productName, SUM(oi.quantity)
            FROM OrderItem oi
            GROUP BY oi.product.id, oi.productName
            ORDER BY SUM(oi.quantity) DESC
            """)
    List<Object[]> findTopSellingProducts(Pageable pageable);
}