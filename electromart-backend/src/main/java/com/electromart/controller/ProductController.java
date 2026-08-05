package com.electromart.controller;

import com.electromart.dto.ApiResponse;
import com.electromart.dto.PagedResponse;
import com.electromart.dto.ProductResponse;
import com.electromart.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ApiResponse<PagedResponse<ProductResponse>> filterProducts(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long brandId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "false") boolean inStockOnly,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        PagedResponse<ProductResponse> result = productService.filterProducts(
                categoryId, brandId, minPrice, maxPrice, keyword, inStockOnly, pageable);

        return ApiResponse.success("Products fetched", result);
    }

    @GetMapping("/featured")
    public ApiResponse<List<ProductResponse>> getFeaturedProducts() {
        return ApiResponse.success("Featured products fetched", productService.getFeaturedProducts());
    }

    @GetMapping("/{slug}")
    public ApiResponse<ProductResponse> getProductBySlug(@PathVariable String slug) {
        return ApiResponse.success("Product fetched", productService.getBySlug(slug));
    }
}
