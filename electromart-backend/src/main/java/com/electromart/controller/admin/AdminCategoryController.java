package com.electromart.controller.admin;

import com.electromart.dto.ApiResponse;
import com.electromart.dto.CategoryRequest;
import com.electromart.dto.CategoryResponse;
import com.electromart.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/admin/categories")
@RequiredArgsConstructor
public class AdminCategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ApiResponse<List<CategoryResponse>> getAll() {
        return ApiResponse.success("Categories fetched", categoryService.getAllForAdmin());
    }

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<ApiResponse<CategoryResponse>> create(
            @Valid @RequestPart("category") CategoryRequest request,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        CategoryResponse response = categoryService.createCategory(request, image);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Category created", response));
    }

    @PutMapping(value = "/{id}", consumes = "multipart/form-data")
    public ApiResponse<CategoryResponse> update(
            @PathVariable Long id,
            @Valid @RequestPart("category") CategoryRequest request,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        return ApiResponse.success("Category updated", categoryService.updateCategory(id, request, image));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Object> delete(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ApiResponse.success("Category deactivated", null);
    }
}
