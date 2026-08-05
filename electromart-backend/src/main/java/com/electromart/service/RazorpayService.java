package com.electromart.service;

import com.electromart.exception.ApiException;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Order;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

@Service
@RequiredArgsConstructor
public class RazorpayService {

    private final RazorpayClient razorpayClient;

    @Value("${razorpay.key-id}")
    private String keyId;

    @Value("${razorpay.key-secret}")
    private String keySecret;

    @Value("${razorpay.webhook-secret:}")
    private String webhookSecret;

    public String getKeyId() {
        return keyId;
    }

    /** Creates a Razorpay Order. Amount must be passed in paise (rupees * 100). */
    public Order createOrder(long amountInPaise, String receiptId) {
        try {
            JSONObject request = new JSONObject();
            request.put("amount", amountInPaise);
            request.put("currency", "INR");
            request.put("receipt", receiptId);
            request.put("payment_capture", 1);
            return razorpayClient.orders.create(request);
        } catch (RazorpayException e) {
            throw new ApiException("Failed to create Razorpay order: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /** Verifies the signature returned by Razorpay Checkout after a successful payment. */
    public boolean verifyPaymentSignature(String razorpayOrderId, String razorpayPaymentId, String razorpaySignature) {
        String payload = razorpayOrderId + "|" + razorpayPaymentId;
        String expectedSignature = hmacSha256(payload, keySecret);
        return constantTimeEquals(expectedSignature, razorpaySignature);
    }

    /** Verifies the X-Razorpay-Signature header on incoming webhook requests using the raw request body. */
    public boolean verifyWebhookSignature(String rawBody, String signatureHeader) {
        if (webhookSecret == null || webhookSecret.isBlank()) {
            throw new ApiException("Webhook secret not configured", HttpStatus.INTERNAL_SERVER_ERROR);
        }
        String expectedSignature = hmacSha256(rawBody, webhookSecret);
        return constantTimeEquals(expectedSignature, signatureHeader);
    }

    private String hmacSha256(String data, String secret) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hash) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (Exception e) {
            throw new ApiException("Signature computation failed", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private boolean constantTimeEquals(String a, String b) {
        if (a == null || b == null) return false;
        return MessageDigest.isEqual(a.getBytes(StandardCharsets.UTF_8), b.getBytes(StandardCharsets.UTF_8));
    }
}
