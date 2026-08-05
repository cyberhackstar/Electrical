package com.electromart.service;

import com.electromart.dto.CategoryRequest;
import com.electromart.dto.CategoryResponse;
import com.electromart.dto.ImageUploadResponse;
import com.electromart.entity.Category;
import com.electromart.exception.ApiException;
import com.electromart.repository.CategoryRepository;
import com.electromart.util.SlugUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final CloudinaryService cloudinaryService;

    @Transactional
    public CategoryResponse createCategory(CategoryRequest request, MultipartFile image) {
        if (categoryRepository.existsByNameIgnoreCase(request.getName())) {
            throw new ApiException("Category with this name already exists", HttpStatus.CONFLICT);
        }

        Category parent = null;
        if (request.getParentId() != null) {
            parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new ApiException("Parent category not found", HttpStatus.NOT_FOUND));
        }

        Category category = Category.builder()
                .name(request.getName())
                .slug(SlugUtil.toSlug(request.getName()))
                .description(request.getDescription())
                .parent(parent)
                .active(true)
                .build();

        if (image != null && !image.isEmpty()) {
            ImageUploadResponse uploaded = cloudinaryService.uploadImage(image, "categories");
            category.setImageUrl(uploaded.getUrl());
            category.setImagePublicId(uploaded.getPublicId());
        }

        categoryRepository.save(category);
        return toResponse(category);
    }

    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryRequest request, MultipartFile image) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ApiException("Category not found", HttpStatus.NOT_FOUND));

        category.setName(request.getName());
        category.setSlug(SlugUtil.toSlug(request.getName()));
        category.setDescription(request.getDescription());

        if (request.getParentId() != null) {
            Category parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new ApiException("Parent category not found", HttpStatus.NOT_FOUND));
            category.setParent(parent);
        } else {
            category.setParent(null);
        }

        if (image != null && !image.isEmpty()) {
            if (category.getImagePublicId() != null) {
                cloudinaryService.deleteImage(category.getImagePublicId());
            }
            ImageUploadResponse uploaded = cloudinaryService.uploadImage(image, "categories");
            category.setImageUrl(uploaded.getUrl());
            category.setImagePublicId(uploaded.getPublicId());
        }

        categoryRepository.save(category);
        return toResponse(category);
    }

    @Transactional
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ApiException("Category not found", HttpStatus.NOT_FOUND));
        category.setActive(false);
        categoryRepository.save(category);
    }

    public List<CategoryResponse> getAllTopLevelCategories() {
        return categoryRepository.findByParentIsNullAndActiveTrue()
                .stream().map(this::toResponse).toList();
    }

    public CategoryResponse getBySlug(String slug) {
        Category category = categoryRepository.findBySlug(slug)
                .orElseThrow(() -> new ApiException("Category not found", HttpStatus.NOT_FOUND));
        return toResponse(category);
    }

    public List<CategoryResponse> getAllForAdmin() {
        return categoryRepository.findAll().stream().map(this::toResponse).toList();
    }

    private CategoryResponse toResponse(Category category) {
        List<CategoryResponse> subs = categoryRepository.findByParentIdAndActiveTrue(category.getId())
                .stream().map(this::toShallowResponse).toList();

        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .description(category.getDescription())
                .imageUrl(category.getImageUrl())
                .parentId(category.getParent() != null ? category.getParent().getId() : null)
                .parentName(category.getParent() != null ? category.getParent().getName() : null)
                .active(category.isActive())
                .subCategories(subs)
                .build();
    }

    private CategoryResponse toShallowResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .imageUrl(category.getImageUrl())
                .active(category.isActive())
                .build();
    }
}
