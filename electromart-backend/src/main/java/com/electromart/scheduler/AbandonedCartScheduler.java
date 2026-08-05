package com.electromart.scheduler;

import com.electromart.entity.Cart;
import com.electromart.repository.CartRepository;
import com.electromart.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Finds carts that have items but haven't been touched in 24+ hours, and haven't
 * already received a reminder, then emails the customer once. The reminder flag
 * resets automatically whenever the cart is next modified (see CartService.addItem).
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AbandonedCartScheduler {

    private final CartRepository cartRepository;
    private final EmailService emailService;

    private static final int ABANDONED_AFTER_HOURS = 24;

    // Runs every 6 hours
    @Scheduled(cron = "0 0 */6 * * *")
    @Transactional
    public void sendAbandonedCartReminders() {
        LocalDateTime threshold = LocalDateTime.now().minusHours(ABANDONED_AFTER_HOURS);
        List<Cart> abandonedCarts = cartRepository.findAbandonedCarts(threshold);

        for (Cart cart : abandonedCarts) {
            try {
                emailService.sendAbandonedCartEmail(cart.getUser().getEmail(), cart.getUser().getFullName());
                cart.setReminderSent(true);
                cartRepository.save(cart);
            } catch (Exception e) {
                log.error("Failed to send abandoned cart email to {}: {}", cart.getUser().getEmail(), e.getMessage());
            }
        }

        if (!abandonedCarts.isEmpty()) {
            log.info("Sent {} abandoned cart reminder email(s)", abandonedCarts.size());
        }
    }
}
