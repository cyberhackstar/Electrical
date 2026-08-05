package com.electromart.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {
    private Long id;
    private String name;
    private String slug;
    private String sku;
    private String description;
    private BigDecimal price;
    private BigDecimal discountPrice;
    private BigDecimal effectivePrice;
    private Integer stockQuantity;
    private boolean inStock;
    private String warranty;
    private Long categoryId;
    private String categoryName;
    private Long brandId;
    private String brandName;
    private Double avgRating;
    private Integer ratingCount;
    private boolean featured;
    private boolean active;
    private List<ProductImageResponse> images;
    private Map<String, String> attributes;
}
