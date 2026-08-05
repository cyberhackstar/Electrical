package com.electromart.repository;

import com.electromart.entity.Brand;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BrandRepository extends JpaRepository<Brand, Long> {

    Optional<Brand> findBySlug(String slug);

    boolean existsByNameIgnoreCase(String name);

    List<Brand> findByActiveTrue();
}
