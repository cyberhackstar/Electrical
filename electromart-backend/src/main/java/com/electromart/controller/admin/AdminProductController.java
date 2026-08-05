package com.electromart.controller.admin;

import com.electromart.dto.*;
import com.electromart.service.ProductBulkUploadService;
import com.electromart.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/admin/products")
@RequiredArgsConstructor
public class AdminProductController {

    private final ProductService productService;
    private final ProductBulkUploadService productBulkUploadService;

    @GetMapping
    public ApiResponse<PagedResponse<ProductResponse>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ApiResponse.success("Products fetched", productService.getAllForAdmin(pageable));
    }

    @GetMapping("/{id}")
    public ApiResponse<ProductResponse> getById(@PathVariable Long id) {
        return ApiResponse.success("Product fetched", productService.getById(id));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProductResponse>> create(@Valid @RequestBody ProductRequest request) {
        ProductResponse response = productService.createProduct(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Product created", response));
    }

    @PutMapping("/{id}")
    public ApiResponse<ProductResponse> update(@PathVariable Long id, @Valid @RequestBody ProductRequest request) {
        return ApiResponse.success("Product updated", productService.updateProduct(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Object> delete(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ApiResponse.success("Product deactivated", null);
    }

    @PostMapping(value = "/{id}/images", consumes = "multipart/form-data")
    public ResponseEntity<ApiResponse<ProductImageResponse>> addImage(
            @PathVariable Long id,
            @RequestPart("image") MultipartFile image,
            @RequestParam(defaultValue = "false") boolean isPrimary) {
        ProductImageResponse response = productService.addProductImage(id, image, isPrimary);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Image uploaded", response));
    }

    @DeleteMapping("/images/{imageId}")
    public ApiResponse<Object> deleteImage(@PathVariable Long imageId) {
        productService.deleteProductImage(imageId);
        return ApiResponse.success("Image deleted", null);
    }

    @PostMapping(value = "/bulk-upload", consumes = "multipart/form-data")
    public ApiResponse<BulkUploadResultResponse> bulkUpload(@RequestPart("file") MultipartFile file) {
        BulkUploadResultResponse result = productBulkUploadService.importFromCsv(file);
        return ApiResponse.success("Bulk upload processed", result);
    }
}
