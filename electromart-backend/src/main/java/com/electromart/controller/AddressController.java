package com.electromart.controller;

import com.electromart.dto.AddressRequest;
import com.electromart.dto.AddressResponse;
import com.electromart.dto.ApiResponse;
import com.electromart.security.CustomUserDetails;
import com.electromart.service.AddressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;

    @GetMapping
    public ApiResponse<List<AddressResponse>> getMyAddresses(@AuthenticationPrincipal CustomUserDetails principal) {
        return ApiResponse.success("Addresses fetched", addressService.getMyAddresses(principal.getUser()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AddressResponse>> addAddress(
            @AuthenticationPrincipal CustomUserDetails principal,
            @Valid @RequestBody AddressRequest request) {
        AddressResponse response = addressService.addAddress(principal.getUser(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Address added", response));
    }

    @PutMapping("/{id}")
    public ApiResponse<AddressResponse> updateAddress(
            @AuthenticationPrincipal CustomUserDetails principal,
            @PathVariable Long id,
            @Valid @RequestBody AddressRequest request) {
        return ApiResponse.success("Address updated", addressService.updateAddress(principal.getUser(), id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Object> deleteAddress(@AuthenticationPrincipal CustomUserDetails principal, @PathVariable Long id) {
        addressService.deleteAddress(principal.getUser(), id);
        return ApiResponse.success("Address deleted", null);
    }
}
