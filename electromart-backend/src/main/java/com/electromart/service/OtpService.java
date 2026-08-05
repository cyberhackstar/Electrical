package com.electromart.service;

import com.electromart.entity.OtpPurpose;
import com.electromart.entity.OtpVerification;
import com.electromart.exception.ApiException;
import com.electromart.repository.OtpVerificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class OtpService {

    private final OtpVerificationRepository otpRepository;
    private final EmailService emailService;

    @Value("${app.otp.expiry-minutes}")
    private int otpExpiryMinutes;

    @Value("${app.otp.length}")
    private int otpLength;

    private static final SecureRandom RANDOM = new SecureRandom();

    public void generateAndSendOtp(String email, OtpPurpose purpose, String purposeText) {
        String otpCode = generateNumericOtp();

        OtpVerification otp = OtpVerification.builder()
                .email(email)
                .otpCode(otpCode)
                .purpose(purpose)
                .expiresAt(LocalDateTime.now().plusMinutes(otpExpiryMinutes))
                .used(false)
                .build();

        otpRepository.save(otp);
        emailService.sendOtpEmail(email, otpCode, purposeText);
    }

    public void verifyOtp(String email, String otpCode, OtpPurpose purpose) {
        OtpVerification otp = otpRepository
                .findTopByEmailAndPurposeAndUsedFalseOrderByCreatedAtDesc(email, purpose)
                .orElseThrow(() -> new ApiException("No OTP found. Please request a new one.", HttpStatus.BAD_REQUEST));

        if (otp.isUsed()) {
            throw new ApiException("OTP already used", HttpStatus.BAD_REQUEST);
        }

        if (otp.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new ApiException("OTP has expired. Please request a new one.", HttpStatus.BAD_REQUEST);
        }

        if (!otp.getOtpCode().equals(otpCode)) {
            throw new ApiException("Invalid OTP", HttpStatus.BAD_REQUEST);
        }

        otp.setUsed(true);
        otpRepository.save(otp);
    }

    private String generateNumericOtp() {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < otpLength; i++) {
            sb.append(RANDOM.nextInt(10));
        }
        return sb.toString();
    }
}
