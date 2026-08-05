package com.electromart.controller;

import com.electromart.entity.Order;
import com.electromart.security.CustomUserDetails;
import com.electromart.service.InvoiceService;
import com.electromart.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class InvoiceController {

    private final OrderService orderService;
    private final InvoiceService invoiceService;

    /** Works for both the order's owner and admin/staff — access check happens inside OrderService. */
    @GetMapping("/{id}/invoice")
    public ResponseEntity<byte[]> downloadInvoice(
            @AuthenticationPrincipal CustomUserDetails principal,
            @PathVariable Long id) {

        Order order = orderService.getOwnedOrEntity(principal.getUser(), id);
        byte[] pdfBytes = invoiceService.generateInvoice(order);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentDisposition(
                ContentDisposition.attachment().filename("Invoice-" + order.getOrderNumber() + ".pdf").build());

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }
}
