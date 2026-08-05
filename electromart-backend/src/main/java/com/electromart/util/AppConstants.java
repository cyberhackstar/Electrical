package com.electromart.util;

import java.math.BigDecimal;
import java.security.SecureRandom;

public class AppConstants {

    // Flat shipping charge for orders below the free-shipping threshold (in INR)
    public static final BigDecimal SHIPPING_CHARGE = new BigDecimal("49.00");
    public static final BigDecimal FREE_SHIPPING_THRESHOLD = new BigDecimal("999.00");

    // Flat GST rate applied on items total (adjust per actual product HSN slabs in production)
    public static final BigDecimal TAX_RATE_PERCENT = new BigDecimal("18.00");

    // COD not allowed above this order value (fraud/logistics risk control)
    public static final BigDecimal COD_MAX_ORDER_VALUE = new BigDecimal("50000.00");

    private static final SecureRandom RANDOM = new SecureRandom();

    public static String generateOrderNumber() {
        long timestamp = System.currentTimeMillis();
        int random = RANDOM.nextInt(900) + 100;
        return "EM" + timestamp + random;
    }
}
