package com.electromart.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CheckoutRequest {

    @NotNull(message = "Address is required")
    private Long addressId;

    private String couponCode;
}
