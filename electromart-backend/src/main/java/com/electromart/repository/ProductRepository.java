package com.electromart.repository;

import com.electromart.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    @EntityGraph(attributePaths = { "images", "attributes", "category", "brand" })
    Optional<Product> findBySlug(String slug);

    @EntityGraph(attributePaths = { "images", "attributes", "category", "brand" })
    @Override
    Optional<Product> findById(Long id);

    @EntityGraph(attributePaths = { "images", "attributes", "category", "brand" })
    @Override
    Page<Product> findAll(Specification<Product> spec, Pageable pageable);

    @EntityGraph(attributePaths = { "images", "attributes", "category", "brand" })
    @Override
    Page<Product> findAll(Pageable pageable);

    @EntityGraph(attributePaths = { "images", "attributes", "category", "brand" })
    @Override
    List<Product> findAll(Specification<Product> spec);

    boolean existsBySku(String sku);

    // Fetch products below or equal to stock threshold
    @Query("SELECT p FROM Product p WHERE p.active = true AND p.stockQuantity <= :threshold ORDER BY p.stockQuantity ASC")
    List<Product> findLowStockProducts(@Param("threshold") int threshold);
}