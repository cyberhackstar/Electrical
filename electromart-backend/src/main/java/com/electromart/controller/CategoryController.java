package com.electromart.controller;

import com.electromart.dto.ApiResponse;
import com.electromart.dto.CategoryResponse;
import com.electromart.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ApiResponse<List<CategoryResponse>> getAllCategories() {
        return ApiResponse.success("Categories fetched", categoryService.getAllTopLevelCategories());
    }

    @GetMapping("/{slug}")
    public ApiResponse<CategoryResponse> getCategoryBySlug(@PathVariable String slug) {
        return ApiResponse.success("Category fetched", categoryService.getBySlug(slug));
    }
}
