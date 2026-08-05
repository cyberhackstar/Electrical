package com.electromart.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendOtpEmail(String toEmail, String otpCode, String purposeText) {
        String subject = "ElectroMart - Your OTP Code";
        String body = """
                <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 24px; border: 1px solid #eee; border-radius: 8px;">
                    <h2 style="color: #1a1a2e;">ElectroMart</h2>
                    <p>Hi,</p>
                    <p>Your OTP for <strong>%s</strong> is:</p>
                    <h1 style="letter-spacing: 6px; color: #f5a623;">%s</h1>
                    <p>This OTP is valid for 5 minutes. Do not share it with anyone.</p>
                    <p style="color: #888; font-size: 12px;">If you did not request this, please ignore this email.</p>
                </div>
                """.formatted(purposeText, otpCode);

        sendHtmlEmail(toEmail, subject, body);
    }

    public void sendOrderConfirmationEmail(String toEmail, String orderId, String customerName) {
        String subject = "ElectroMart - Order Confirmed (#" + orderId + ")";
        String body = """
                <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 24px; border: 1px solid #eee; border-radius: 8px;">
                    <h2 style="color: #1a1a2e;">ElectroMart</h2>
                    <p>Hi %s,</p>
                    <p>Your order <strong>#%s</strong> has been placed successfully. We'll notify you once it's shipped.</p>
                    <p>Thank you for shopping with ElectroMart!</p>
                </div>
                """.formatted(customerName, orderId);

        sendHtmlEmail(toEmail, subject, body);
    }

    public void sendAbandonedCartEmail(String toEmail, String customerName) {
        String subject = "You left something in your cart at ElectroMart";
        String body = """
                <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 24px; border: 1px solid #eee; border-radius: 8px;">
                    <h2 style="color: #1a1a2e;">ElectroMart</h2>
                    <p>Hi %s,</p>
                    <p>You still have items waiting in your cart. Complete your purchase before they go out of stock!</p>
                    <p style="margin-top: 20px;">
                        <a href="http://localhost:4200/cart" style="background: #f5a623; color: #1a1a2e; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">
                            Return to Cart
                        </a>
                    </p>
                </div>
                """.formatted(customerName);

        sendHtmlEmail(toEmail, subject, body);
    }

    private void sendHtmlEmail(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send email: " + e.getMessage(), e);
        }
    }
}
