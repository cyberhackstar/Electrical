package com.electromart.repository;

import com.electromart.entity.ProductQuestion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductQuestionRepository extends JpaRepository<ProductQuestion, Long> {

    List<ProductQuestion> findByProductIdOrderByCreatedAtDesc(Long productId);
}
