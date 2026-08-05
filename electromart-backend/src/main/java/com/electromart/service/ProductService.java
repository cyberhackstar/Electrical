package com.electromart.service;

import com.electromart.dto.*;
import com.electromart.entity.*;
import com.electromart.exception.ApiException;
import com.electromart.repository.BrandRepository;
import com.electromart.repository.CategoryRepository;
import com.electromart.repository.ProductImageRepository;
import com.electromart.repository.ProductRepository;
import com.electromart.service.spec.ProductSpecifications;
import com.electromart.util.SlugUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ProductService {

        private final ProductRepository productRepository;
        private final CategoryRepository categoryRepository;
        private final BrandRepository brandRepository;
        private final ProductImageRepository productImageRepository;
        private final CloudinaryService cloudinaryService;

        @Transactional
        public ProductResponse createProduct(ProductRequest request) {
                if (productRepository.existsBySku(request.getSku())) {
                        throw new ApiException("SKU already exists", HttpStatus.CONFLICT);
                }

                Category category = categoryRepository.findById(request.getCategoryId())
                                .orElseThrow(() -> new ApiException("Category not found", HttpStatus.NOT_FOUND));

                Brand brand = null;
                if (request.getBrandId() != null) {
                        brand = brandRepository.findById(request.getBrandId())
                                        .orElseThrow(() -> new ApiException("Brand not found", HttpStatus.NOT_FOUND));
                }

                Product product = Product.builder()
                                .name(request.getName())
                                .slug(SlugUtil.toSlug(request.getName()) + "-" + System.currentTimeMillis() % 100000)
                                .sku(request.getSku())
                                .description(request.getDescription())
                                .price(request.getPrice())
                                .discountPrice(request.getDiscountPrice())
                                .stockQuantity(request.getStockQuantity())
                                .warranty(request.getWarranty())
                                .category(category)
                                .brand(brand)
                                .featured(request.isFeatured())
                                .active(true)
                                .build();

                productRepository.save(product);
                attachAttributes(product, request.getAttributes());

                return toResponse(product);
        }

        @Transactional
        public ProductResponse updateProduct(Long id, ProductRequest request) {
                Product product = productRepository.findById(id)
                                .orElseThrow(() -> new ApiException("Product not found", HttpStatus.NOT_FOUND));

                Category category = categoryRepository.findById(request.getCategoryId())
                                .orElseThrow(() -> new ApiException("Category not found", HttpStatus.NOT_FOUND));

                Brand brand = null;
                if (request.getBrandId() != null) {
                        brand = brandRepository.findById(request.getBrandId())
                                        .orElseThrow(() -> new ApiException("Brand not found", HttpStatus.NOT_FOUND));
                }

                product.setName(request.getName());
                product.setDescription(request.getDescription());
                product.setPrice(request.getPrice());
                product.setDiscountPrice(request.getDiscountPrice());
                product.setStockQuantity(request.getStockQuantity());
                product.setWarranty(request.getWarranty());
                product.setCategory(category);
                product.setBrand(brand);
                product.setFeatured(request.isFeatured());

                product.getAttributes().clear();
                productRepository.save(product);
                attachAttributes(product, request.getAttributes());

                return toResponse(product);
        }

        @Transactional
        public void deleteProduct(Long id) {
                Product product = productRepository.findById(id)
                                .orElseThrow(() -> new ApiException("Product not found", HttpStatus.NOT_FOUND));
                product.setActive(false);
                productRepository.save(product);
        }

        @Transactional
        public ProductImageResponse addProductImage(Long productId, MultipartFile file, boolean isPrimary) {
                Product product = productRepository.findById(productId)
                                .orElseThrow(() -> new ApiException("Product not found", HttpStatus.NOT_FOUND));

                ImageUploadResponse uploaded = cloudinaryService.uploadImage(file, "products");

                if (isPrimary) {
                        product.getImages().forEach(img -> img.setPrimary(false));
                }

                ProductImage image = ProductImage.builder()
                                .product(product)
                                .imageUrl(uploaded.getUrl())
                                .publicId(uploaded.getPublicId())
                                .displayOrder(product.getImages().size())
                                .primary(isPrimary || product.getImages().isEmpty())
                                .build();

                productImageRepository.save(image);
                product.getImages().add(image);

                return ProductImageResponse.builder()
                                .id(image.getId())
                                .imageUrl(image.getImageUrl())
                                .displayOrder(image.getDisplayOrder())
                                .primary(image.isPrimary())
                                .build();
        }

        @Transactional
        public void deleteProductImage(Long imageId) {
                ProductImage image = productImageRepository.findById(imageId)
                                .orElseThrow(() -> new ApiException("Image not found", HttpStatus.NOT_FOUND));
                cloudinaryService.deleteImage(image.getPublicId());
                productImageRepository.delete(image);
        }

        @Transactional(readOnly = true)
        public ProductResponse getBySlug(String slug) {
                Product product = productRepository.findBySlug(slug)
                                .orElseThrow(() -> new ApiException("Product not found", HttpStatus.NOT_FOUND));
                return toResponse(product);
        }

        @Transactional(readOnly = true)
        public ProductResponse getById(Long id) {
                Product product = productRepository.findById(id)
                                .orElseThrow(() -> new ApiException("Product not found", HttpStatus.NOT_FOUND));
                return toResponse(product);
        }

        @Transactional(readOnly = true)
        public PagedResponse<ProductResponse> filterProducts(
                        Long categoryId, Long brandId, BigDecimal minPrice, BigDecimal maxPrice,
                        String keyword, boolean inStockOnly, Pageable pageable) {

                Specification<Product> spec = Specification.allOf(
                                ProductSpecifications.isActive(),
                                ProductSpecifications.hasCategory(categoryId),
                                ProductSpecifications.hasBrand(brandId),
                                ProductSpecifications.priceGreaterThanOrEqual(minPrice),
                                ProductSpecifications.priceLessThanOrEqual(maxPrice),
                                ProductSpecifications.keywordMatches(keyword),
                                ProductSpecifications.inStockOnly(inStockOnly));

                Page<Product> page = productRepository.findAll(spec, pageable);
                return PagedResponse.from(page.map(this::toResponse));
        }

        @Transactional(readOnly = true)
        public PagedResponse<ProductResponse> getAllForAdmin(Pageable pageable) {
                Page<Product> page = productRepository.findAll(pageable);
                return PagedResponse.from(page.map(this::toResponse));
        }

        @Transactional(readOnly = true)
        public List<ProductResponse> getFeaturedProducts() {
                Specification<Product> spec = Specification.allOf(
                                ProductSpecifications.isActive(),
                                (root, query, cb) -> cb.isTrue(root.get("featured")));
                return productRepository.findAll(spec).stream().map(this::toResponse).toList();
        }

        private void attachAttributes(Product product, List<ProductAttributeDto> attributeDtos) {
                if (attributeDtos == null)
                        return;
                List<ProductAttribute> attributes = new ArrayList<>();
                for (ProductAttributeDto dto : attributeDtos) {
                        attributes.add(ProductAttribute.builder()
                                        .product(product)
                                        .attributeKey(dto.getAttributeKey())
                                        .attributeValue(dto.getAttributeValue())
                                        .build());
                }
                product.getAttributes().addAll(attributes);
                productRepository.save(product);
        }

        private ProductResponse toResponse(Product product) {
                List<ProductImageResponse> images = (product.getImages() != null ? product.getImages()
                                : List.<ProductImage>of()).stream()
                                .map(img -> ProductImageResponse.builder()
                                                .id(img.getId())
                                                .imageUrl(img.getImageUrl())
                                                .displayOrder(img.getDisplayOrder())
                                                .primary(img.isPrimary())
                                                .build())
                                .toList();

                Map<String, String> attributes = new LinkedHashMap<>();
                if (product.getAttributes() != null) {
                        product.getAttributes()
                                        .forEach(a -> attributes.put(a.getAttributeKey(), a.getAttributeValue()));
                }

                return ProductResponse.builder()
                                .id(product.getId())
                                .name(product.getName())
                                .slug(product.getSlug())
                                .sku(product.getSku())
                                .description(product.getDescription())
                                .price(product.getPrice())
                                .discountPrice(product.getDiscountPrice())
                                .effectivePrice(product.getEffectivePrice())
                                .stockQuantity(product.getStockQuantity())
                                .inStock(product.getStockQuantity() != null && product.getStockQuantity() > 0)
                                .warranty(product.getWarranty())
                                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                                .brandId(product.getBrand() != null ? product.getBrand().getId() : null)
                                .brandName(product.getBrand() != null ? product.getBrand().getName() : null)
                                .avgRating(product.getAvgRating())
                                .ratingCount(product.getRatingCount())
                                .featured(product.isFeatured())
                                .active(product.isActive())
                                .images(images)
                                .attributes(attributes)
                                .build();
        }
}