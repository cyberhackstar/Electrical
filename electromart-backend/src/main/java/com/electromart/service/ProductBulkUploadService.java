package com.electromart.service;

import com.electromart.dto.BulkUploadResultResponse;
import com.electromart.dto.ProductAttributeDto;
import com.electromart.dto.ProductRequest;
import com.electromart.entity.Brand;
import com.electromart.entity.Category;
import com.electromart.exception.ApiException;
import com.electromart.repository.BrandRepository;
import com.electromart.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

/**
 * Expected CSV header (in this exact order):
 * name,sku,description,price,discountPrice,stockQuantity,warranty,categorySlug,brandName,attributes
 *
 * - discountPrice, warranty, brandName, attributes may be left empty.
 * - attributes format (optional): "Voltage:220V;Wattage:60W;Material:Copper"
 * - categorySlug must match an existing category's slug exactly.
 * - brandName must match an existing brand's name exactly (case-insensitive); left blank = no brand.
 * - Wrap any field containing a comma in double quotes, e.g. "Heavy duty, 2-pin socket".
 */
@Service
@RequiredArgsConstructor
public class ProductBulkUploadService {

    private final ProductService productService;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;

    private static final int EXPECTED_COLUMNS = 10;

    public BulkUploadResultResponse importFromCsv(MultipartFile file) {
        if (file.isEmpty()) {
            throw new ApiException("CSV file is empty", HttpStatus.BAD_REQUEST);
        }

        List<String> errors = new ArrayList<>();
        int totalRows = 0;
        int successCount = 0;

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            String headerLine = reader.readLine();
            if (headerLine == null) {
                throw new ApiException("CSV file has no header row", HttpStatus.BAD_REQUEST);
            }

            String line;
            int rowNumber = 1;
            while ((line = reader.readLine()) != null) {
                rowNumber++;
                if (line.isBlank()) continue;
                totalRows++;

                try {
                    List<String> fields = parseCsvLine(line);
                    if (fields.size() < EXPECTED_COLUMNS) {
                        throw new IllegalArgumentException("Expected " + EXPECTED_COLUMNS + " columns, found " + fields.size());
                    }

                    ProductRequest request = buildProductRequest(fields);
                    productService.createProduct(request);
                    successCount++;
                } catch (Exception rowError) {
                    errors.add("Row " + rowNumber + ": " + rowError.getMessage());
                }
            }
        } catch (IOException e) {
            throw new ApiException("Failed to read CSV file: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        }

        return BulkUploadResultResponse.builder()
                .totalRows(totalRows)
                .successCount(successCount)
                .failureCount(totalRows - successCount)
                .errors(errors)
                .build();
    }

    private ProductRequest buildProductRequest(List<String> f) {
        String name = f.get(0).trim();
        String sku = f.get(1).trim();
        String description = f.get(2).trim();
        String priceStr = f.get(3).trim();
        String discountPriceStr = f.get(4).trim();
        String stockStr = f.get(5).trim();
        String warranty = f.get(6).trim();
        String categorySlug = f.get(7).trim();
        String brandName = f.get(8).trim();
        String attributesRaw = f.get(9).trim();

        if (name.isEmpty()) throw new IllegalArgumentException("Product name is required");
        if (sku.isEmpty()) throw new IllegalArgumentException("SKU is required");

        Category category = categoryRepository.findBySlug(categorySlug)
                .orElseThrow(() -> new IllegalArgumentException("Category not found for slug: " + categorySlug));

        Long brandId = null;
        if (!brandName.isEmpty()) {
            Brand brand = brandRepository.findAll().stream()
                    .filter(b -> b.getName().equalsIgnoreCase(brandName))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Brand not found: " + brandName));
            brandId = brand.getId();
        }

        ProductRequest request = new ProductRequest();
        request.setName(name);
        request.setSku(sku);
        request.setDescription(description);
        request.setPrice(new BigDecimal(priceStr));
        request.setDiscountPrice(discountPriceStr.isEmpty() ? null : new BigDecimal(discountPriceStr));
        request.setStockQuantity(Integer.parseInt(stockStr));
        request.setWarranty(warranty.isEmpty() ? null : warranty);
        request.setCategoryId(category.getId());
        request.setBrandId(brandId);
        request.setFeatured(false);

        if (!attributesRaw.isEmpty()) {
            List<ProductAttributeDto> attrs = new ArrayList<>();
            for (String pair : attributesRaw.split(";")) {
                String[] kv = pair.split(":", 2);
                if (kv.length == 2 && !kv[0].isBlank()) {
                    attrs.add(ProductAttributeDto.builder()
                            .attributeKey(kv[0].trim())
                            .attributeValue(kv[1].trim())
                            .build());
                }
            }
            request.setAttributes(attrs);
        }

        return request;
    }

    /** Minimal CSV line parser supporting double-quoted fields (so descriptions can contain commas). */
    private List<String> parseCsvLine(String line) {
        List<String> fields = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        boolean inQuotes = false;

        for (int i = 0; i < line.length(); i++) {
            char c = line.charAt(i);
            if (c == '"') {
                inQuotes = !inQuotes;
            } else if (c == ',' && !inQuotes) {
                fields.add(current.toString());
                current.setLength(0);
            } else {
                current.append(c);
            }
        }
        fields.add(current.toString());
        return fields;
    }
}
