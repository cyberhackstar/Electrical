package com.electromart.service;

import com.electromart.dto.WishlistResponse;
import com.electromart.entity.Product;
import com.electromart.entity.ProductImage;
import com.electromart.entity.User;
import com.electromart.entity.Wishlist;
import com.electromart.exception.ApiException;
import com.electromart.repository.ProductRepository;
import com.electromart.repository.WishlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final ProductRepository productRepository;

    @Transactional
    public WishlistResponse addToWishlist(User user, Long productId) {
        if (wishlistRepository.existsByUserIdAndProductId(user.getId(), productId)) {
            throw new ApiException("Product already in wishlist", HttpStatus.CONFLICT);
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ApiException("Product not found", HttpStatus.NOT_FOUND));

        Wishlist wishlist = Wishlist.builder().user(user).product(product).build();
        wishlistRepository.save(wishlist);

        return toResponse(wishlist);
    }

    @Transactional
    public void removeFromWishlist(User user, Long productId) {
        Wishlist wishlist = wishlistRepository.findByUserIdAndProductId(user.getId(), productId)
                .orElseThrow(() -> new ApiException("Item not found in wishlist", HttpStatus.NOT_FOUND));
        wishlistRepository.delete(wishlist);
    }

    @Transactional(readOnly = true)
    public List<WishlistResponse> getMyWishlist(User user) {
        return wishlistRepository.findByUserIdOrderByAddedAtDesc(user.getId())
                .stream().map(this::toResponse).toList();
    }

    private WishlistResponse toResponse(Wishlist wishlist) {
        Product p = wishlist.getProduct();

        // Safely extract the primary image or fallback to the first item in the Set
        String imageUrl = (p.getImages() != null && !p.getImages().isEmpty())
                ? p.getImages().stream()
                        .filter(ProductImage::isPrimary)
                        .findFirst()
                        .orElse(p.getImages().iterator().next())
                        .getImageUrl()
                : null;

        return WishlistResponse.builder()
                .wishlistItemId(wishlist.getId())
                .productId(p.getId())
                .productName(p.getName())
                .productSlug(p.getSlug())
                .productImage(imageUrl)
                .price(p.getEffectivePrice())
                .inStock(p.getStockQuantity() != null && p.getStockQuantity() > 0)
                .build();
    }
}