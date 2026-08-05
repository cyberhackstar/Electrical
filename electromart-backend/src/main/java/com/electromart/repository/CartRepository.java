package com.electromart.repository;

import com.electromart.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Long> {

    Optional<Cart> findByUserId(Long userId);

    @Query("""
            SELECT DISTINCT c FROM Cart c
            LEFT JOIN FETCH c.items i
            LEFT JOIN FETCH i.product
            WHERE c.user.id = :userId
            """)
    Optional<Cart> findByUserIdWithItems(@Param("userId") Long userId);

    @Query("""
            SELECT c FROM Cart c
            WHERE c.updatedAt < :threshold
            AND c.reminderSent = false
            AND SIZE(c.items) > 0
            """)
    List<Cart> findAbandonedCarts(@Param("threshold") LocalDateTime threshold);
}
