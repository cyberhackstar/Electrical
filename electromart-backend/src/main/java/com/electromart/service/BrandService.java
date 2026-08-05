package com.electromart.service;

import com.electromart.dto.BrandRequest;
import com.electromart.dto.BrandResponse;
import com.electromart.dto.ImageUploadResponse;
import com.electromart.entity.Brand;
import com.electromart.exception.ApiException;
import com.electromart.repository.BrandRepository;
import com.electromart.util.SlugUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BrandService {

    private final BrandRepository brandRepository;
    private final CloudinaryService cloudinaryService;

    @Transactional
    public BrandResponse createBrand(BrandRequest request, MultipartFile logo) {
        if (brandRepository.existsByNameIgnoreCase(request.getName())) {
            throw new ApiException("Brand with this name already exists", HttpStatus.CONFLICT);
        }

        Brand brand = Brand.builder()
                .name(request.getName())
                .slug(SlugUtil.toSlug(request.getName()))
                .active(true)
                .build();

        if (logo != null && !logo.isEmpty()) {
            ImageUploadResponse uploaded = cloudinaryService.uploadImage(logo, "brands");
            brand.setLogoUrl(uploaded.getUrl());
            brand.setLogoPublicId(uploaded.getPublicId());
        }

        brandRepository.save(brand);
        return toResponse(brand);
    }

    @Transactional
    public BrandResponse updateBrand(Long id, BrandRequest request, MultipartFile logo) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new ApiException("Brand not found", HttpStatus.NOT_FOUND));

        brand.setName(request.getName());
        brand.setSlug(SlugUtil.toSlug(request.getName()));

        if (logo != null && !logo.isEmpty()) {
            if (brand.getLogoPublicId() != null) {
                cloudinaryService.deleteImage(brand.getLogoPublicId());
            }
            ImageUploadResponse uploaded = cloudinaryService.uploadImage(logo, "brands");
            brand.setLogoUrl(uploaded.getUrl());
            brand.setLogoPublicId(uploaded.getPublicId());
        }

        brandRepository.save(brand);
        return toResponse(brand);
    }

    @Transactional
    public void deleteBrand(Long id) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new ApiException("Brand not found", HttpStatus.NOT_FOUND));
        brand.setActive(false);
        brandRepository.save(brand);
    }

    public List<BrandResponse> getAllActiveBrands() {
        return brandRepository.findByActiveTrue().stream().map(this::toResponse).toList();
    }

    public List<BrandResponse> getAllForAdmin() {
        return brandRepository.findAll().stream().map(this::toResponse).toList();
    }

    private BrandResponse toResponse(Brand brand) {
        return BrandResponse.builder()
                .id(brand.getId())
                .name(brand.getName())
                .slug(brand.getSlug())
                .logoUrl(brand.getLogoUrl())
                .active(brand.isActive())
                .build();
    }
}
