package com.electromart.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RazorpayOrderResponse {
    private Long internalOrderId;
    private String orderNumber;
    private String razorpayOrderId;
    private long amountInPaise;
    private String currency;
    private String razorpayKeyId;
}
