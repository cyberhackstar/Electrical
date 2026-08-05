package com.electromart.service;

import com.electromart.dto.CartItemRequest;
import com.electromart.dto.CartItemResponse;
import com.electromart.dto.CartResponse;
import com.electromart.entity.Cart;
import com.electromart.entity.CartItem;
import com.electromart.entity.Product;
import com.electromart.entity.ProductImage;
import com.electromart.entity.User;
import com.electromart.exception.ApiException;
import com.electromart.repository.CartItemRepository;
import com.electromart.repository.CartRepository;
import com.electromart.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;

    @Transactional
    public CartResponse addItem(User user, CartItemRequest request) {
        Cart cart = getOrCreateCart(user);

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ApiException("Product not found", HttpStatus.NOT_FOUND));

        if (!product.isActive()) {
            throw new ApiException("This product is currently unavailable", HttpStatus.BAD_REQUEST);
        }

        CartItem item = cartItemRepository.findByCartIdAndProductId(cart.getId(), product.getId())
                .orElse(null);

        if (item == null) {
            item = CartItem.builder().cart(cart).product(product).quantity(request.getQuantity()).build();
        } else {
            item.setQuantity(item.getQuantity() + request.getQuantity());
        }

        if (item.getQuantity() > product.getStockQuantity()) {
            throw new ApiException("Only " + product.getStockQuantity() + " unit(s) available in stock",
                    HttpStatus.BAD_REQUEST);
        }

        cart.setReminderSent(false);
        cartRepository.save(cart);
        cartItemRepository.save(item);

        return getCart(user);
    }

    @Transactional
    public CartResponse updateItemQuantity(User user, Long itemId, int quantity) {
        Cart cart = getOrCreateCart(user);
        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ApiException("Cart item not found", HttpStatus.NOT_FOUND));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new ApiException("You do not have access to this cart item", HttpStatus.FORBIDDEN);
        }

        if (quantity < 1) {
            cartItemRepository.delete(item);
        } else {
            if (quantity > item.getProduct().getStockQuantity()) {
                throw new ApiException("Only " + item.getProduct().getStockQuantity() + " unit(s) available in stock",
                        HttpStatus.BAD_REQUEST);
            }
            item.setQuantity(quantity);
            cartItemRepository.save(item);
        }

        return getCart(user);
    }

    @Transactional
    public CartResponse removeItem(User user, Long itemId) {
        Cart cart = getOrCreateCart(user);
        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ApiException("Cart item not found", HttpStatus.NOT_FOUND));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new ApiException("You do not have access to this cart item", HttpStatus.FORBIDDEN);
        }

        cartItemRepository.delete(item);
        return getCart(user);
    }

    @Transactional
    public void clearCart(User user) {
        Cart cart = getOrCreateCart(user);
        cart.getItems().clear();
        cartRepository.save(cart);
    }

    @Transactional
    public CartResponse getCart(User user) {
        // Find existing cart or create a new one inside a read-write transaction
        Cart cart = cartRepository.findByUserIdWithItems(user.getId())
                .orElseGet(() -> createCart(user));

        var itemResponses = cart.getItems().stream().map(item -> {
            Product p = item.getProduct();
            BigDecimal price = p.getEffectivePrice();

            String imageUrl = (p.getImages() != null && !p.getImages().isEmpty())
                    ? p.getImages().stream()
                            .filter(ProductImage::isPrimary)
                            .findFirst()
                            .orElse(p.getImages().iterator().next())
                            .getImageUrl()
                    : null;

            return CartItemResponse.builder()
                    .id(item.getId())
                    .productId(p.getId())
                    .productName(p.getName())
                    .productSlug(p.getSlug())
                    .productImage(imageUrl)
                    .price(price)
                    .quantity(item.getQuantity())
                    .subtotal(price.multiply(BigDecimal.valueOf(item.getQuantity())))
                    .inStock(p.getStockQuantity() >= item.getQuantity())
                    .availableStock(p.getStockQuantity())
                    .build();
        }).toList();

        BigDecimal subtotal = itemResponses.stream()
                .map(CartItemResponse::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int totalItems = itemResponses.stream().mapToInt(CartItemResponse::getQuantity).sum();

        return CartResponse.builder()
                .items(itemResponses)
                .totalItems(totalItems)
                .subtotal(subtotal)
                .build();
    }

    @Transactional
    public Cart createCart(User user) {
        return cartRepository.save(Cart.builder().user(user).build());
    }

    @Transactional
    public Cart getOrCreateCart(User user) {
        return cartRepository.findByUserId(user.getId())
                .orElseGet(() -> createCart(user));
    }
}