package com.electromart.controller.admin;

import com.electromart.dto.ApiResponse;
import com.electromart.dto.BrandRequest;
import com.electromart.dto.BrandResponse;
import com.electromart.service.BrandService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/admin/brands")
@RequiredArgsConstructor
public class AdminBrandController {

    private final BrandService brandService;

    @GetMapping
    public ApiResponse<List<BrandResponse>> getAll() {
        return ApiResponse.success("Brands fetched", brandService.getAllForAdmin());
    }

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<ApiResponse<BrandResponse>> create(
            @Valid @RequestPart("brand") BrandRequest request,
            @RequestPart(value = "logo", required = false) MultipartFile logo) {
        BrandResponse response = brandService.createBrand(request, logo);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Brand created", response));
    }

    @PutMapping(value = "/{id}", consumes = "multipart/form-data")
    public ApiResponse<BrandResponse> update(
            @PathVariable Long id,
            @Valid @RequestPart("brand") BrandRequest request,
            @RequestPart(value = "logo", required = false) MultipartFile logo) {
        return ApiResponse.success("Brand updated", brandService.updateBrand(id, request, logo));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Object> delete(@PathVariable Long id) {
        brandService.deleteBrand(id);
        return ApiResponse.success("Brand deactivated", null);
    }
}
