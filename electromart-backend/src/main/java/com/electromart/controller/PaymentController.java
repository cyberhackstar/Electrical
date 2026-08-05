package com.electromart.controller;

import com.electromart.dto.ApiResponse;
import com.electromart.dto.OrderResponse;
import com.electromart.dto.PaymentVerificationRequest;
import com.electromart.security.CustomUserDetails;
import com.electromart.service.OrderService;
import com.electromart.service.RazorpayService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final OrderService orderService;
    private final RazorpayService razorpayService;

    /** Called by the Angular frontend from Razorpay Checkout's success handler (client-side verification path). */
    @PostMapping("/verify")
    public ApiResponse<OrderResponse> verifyPayment(
            @AuthenticationPrincipal CustomUserDetails principal,
            @Valid @RequestBody PaymentVerificationRequest request) {
        return ApiResponse.success("Payment verified", orderService.verifyRazorpayPayment(principal.getUser(), request));
    }

    /**
     * Server-to-server webhook configured in the Razorpay Dashboard.
     * This is the reliable path — it fires even if the customer closes the browser
     * right after paying, before the client-side /verify call completes.
     * Must be public (no JWT) since Razorpay's servers call it directly.
     */
    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(
            @RequestBody String rawBody,
            @RequestHeader("X-Razorpay-Signature") String signature) {

        boolean valid = razorpayService.verifyWebhookSignature(rawBody, signature);
        if (!valid) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid signature");
        }

        JSONObject payload = new JSONObject(rawBody);
        String event = payload.optString("event");

        if ("payment.captured".equals(event)) {
            JSONObject payment = payload.getJSONObject("payload").getJSONObject("payment").getJSONObject("entity");
            orderService.markPaidFromWebhook(payment.getString("order_id"), payment.getString("id"));
        } else if ("payment.failed".equals(event)) {
            JSONObject payment = payload.getJSONObject("payload").getJSONObject("payment").getJSONObject("entity");
            orderService.markFailedFromWebhook(payment.getString("order_id"));
        }

        return ResponseEntity.ok("OK");
    }
}
