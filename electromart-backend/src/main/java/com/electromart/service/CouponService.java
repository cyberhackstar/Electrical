package com.electromart.service;

import com.electromart.dto.CouponRequest;
import com.electromart.dto.CouponResponse;
import com.electromart.dto.CouponValidationResponse;
import com.electromart.entity.Coupon;
import com.electromart.entity.DiscountType;
import com.electromart.exception.ApiException;
import com.electromart.repository.CouponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CouponService {

    private final CouponRepository couponRepository;

    @Transactional
    public CouponResponse createCoupon(CouponRequest request) {
        if (couponRepository.existsByCodeIgnoreCase(request.getCode())) {
            throw new ApiException("Coupon code already exists", HttpStatus.CONFLICT);
        }

        Coupon coupon = Coupon.builder()
                .code(request.getCode().toUpperCase())
                .discountType(request.getDiscountType())
                .discountValue(request.getDiscountValue())
                .minOrderValue(request.getMinOrderValue())
                .maxDiscountAmount(request.getMaxDiscountAmount())
                .expiryDate(request.getExpiryDate())
                .usageLimit(request.getUsageLimit())
                .usedCount(0)
                .active(true)
                .build();

        couponRepository.save(coupon);
        return toResponse(coupon);
    }

    @Transactional
    public CouponResponse updateCoupon(Long id, CouponRequest request) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ApiException("Coupon not found", HttpStatus.NOT_FOUND));

        coupon.setDiscountType(request.getDiscountType());
        coupon.setDiscountValue(request.getDiscountValue());
        coupon.setMinOrderValue(request.getMinOrderValue());
        coupon.setMaxDiscountAmount(request.getMaxDiscountAmount());
        coupon.setExpiryDate(request.getExpiryDate());
        coupon.setUsageLimit(request.getUsageLimit());

        couponRepository.save(coupon);
        return toResponse(coupon);
    }

    @Transactional
    public void deactivateCoupon(Long id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ApiException("Coupon not found", HttpStatus.NOT_FOUND));
        coupon.setActive(false);
        couponRepository.save(coupon);
    }

    public List<CouponResponse> getAllForAdmin() {
        return couponRepository.findAll().stream().map(this::toResponse).toList();
    }

    /**
     * Validates a coupon against a cart subtotal and returns the discount preview,
     * WITHOUT incrementing usedCount. Actual redemption happens at order placement time.
     */
    public CouponValidationResponse validateCoupon(String code, BigDecimal cartSubtotal) {
        Coupon coupon = getValidatableCoupon(code, cartSubtotal);
        BigDecimal discount = calculateDiscount(coupon, cartSubtotal);
        return CouponValidationResponse.builder()
                .code(coupon.getCode())
                .discountAmount(discount)
                .payableAmount(cartSubtotal.subtract(discount))
                .build();
    }

    /** Used internally by OrderService at checkout time; also increments usedCount. */
    @Transactional
    public BigDecimal applyCouponAtCheckout(String code, BigDecimal cartSubtotal) {
        Coupon coupon = getValidatableCoupon(code, cartSubtotal);
        BigDecimal discount = calculateDiscount(coupon, cartSubtotal);
        coupon.setUsedCount(coupon.getUsedCount() + 1);
        couponRepository.save(coupon);
        return discount;
    }

    private Coupon getValidatableCoupon(String code, BigDecimal cartSubtotal) {
        Coupon coupon = couponRepository.findByCodeIgnoreCase(code)
                .orElseThrow(() -> new ApiException("Invalid coupon code", HttpStatus.BAD_REQUEST));

        if (!coupon.isActive()) {
            throw new ApiException("This coupon is no longer active", HttpStatus.BAD_REQUEST);
        }
        if (coupon.getExpiryDate().isBefore(LocalDate.now())) {
            throw new ApiException("This coupon has expired", HttpStatus.BAD_REQUEST);
        }
        if (coupon.getUsageLimit() != null && coupon.getUsedCount() >= coupon.getUsageLimit()) {
            throw new ApiException("This coupon has reached its usage limit", HttpStatus.BAD_REQUEST);
        }
        if (coupon.getMinOrderValue() != null && cartSubtotal.compareTo(coupon.getMinOrderValue()) < 0) {
            throw new ApiException("Minimum order value of ₹" + coupon.getMinOrderValue() + " required for this coupon", HttpStatus.BAD_REQUEST);
        }
        return coupon;
    }

    private BigDecimal calculateDiscount(Coupon coupon, BigDecimal cartSubtotal) {
        BigDecimal discount;
        if (coupon.getDiscountType() == DiscountType.PERCENTAGE) {
            discount = cartSubtotal.multiply(coupon.getDiscountValue()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            if (coupon.getMaxDiscountAmount() != null && discount.compareTo(coupon.getMaxDiscountAmount()) > 0) {
                discount = coupon.getMaxDiscountAmount();
            }
        } else {
            discount = coupon.getDiscountValue();
        }
        return discount.min(cartSubtotal);
    }

    private CouponResponse toResponse(Coupon coupon) {
        return CouponResponse.builder()
                .id(coupon.getId())
                .code(coupon.getCode())
                .discountType(coupon.getDiscountType())
                .discountValue(coupon.getDiscountValue())
                .minOrderValue(coupon.getMinOrderValue())
                .maxDiscountAmount(coupon.getMaxDiscountAmount())
                .expiryDate(coupon.getExpiryDate())
                .usageLimit(coupon.getUsageLimit())
                .usedCount(coupon.getUsedCount())
                .active(coupon.isActive())
                .build();
    }
}
