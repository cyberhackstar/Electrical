package com.electromart.service;

import com.electromart.dto.AnswerRequest;
import com.electromart.dto.QuestionRequest;
import com.electromart.dto.QuestionResponse;
import com.electromart.entity.Product;
import com.electromart.entity.ProductQuestion;
import com.electromart.entity.User;
import com.electromart.exception.ApiException;
import com.electromart.repository.ProductQuestionRepository;
import com.electromart.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductQAService {

    private final ProductQuestionRepository questionRepository;
    private final ProductRepository productRepository;

    @Transactional
    public QuestionResponse askQuestion(User user, QuestionRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ApiException("Product not found", HttpStatus.NOT_FOUND));

        ProductQuestion question = ProductQuestion.builder()
                .product(product)
                .askedBy(user)
                .questionText(request.getQuestionText())
                .build();

        questionRepository.save(question);
        return toResponse(question);
    }

    @Transactional
    public QuestionResponse answerQuestion(User staffUser, Long questionId, AnswerRequest request) {
        ProductQuestion question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ApiException("Question not found", HttpStatus.NOT_FOUND));

        question.setAnswerText(request.getAnswerText());
        question.setAnsweredBy(staffUser);
        question.setAnsweredAt(LocalDateTime.now());

        questionRepository.save(question);
        return toResponse(question);
    }

    public List<QuestionResponse> getQuestionsForProduct(Long productId) {
        return questionRepository.findByProductIdOrderByCreatedAtDesc(productId)
                .stream().map(this::toResponse).toList();
    }

    private QuestionResponse toResponse(ProductQuestion q) {
        return QuestionResponse.builder()
                .id(q.getId())
                .productId(q.getProduct().getId())
                .askerName(q.getAskedBy().getFullName())
                .questionText(q.getQuestionText())
                .answerText(q.getAnswerText())
                .answeredByName(q.getAnsweredBy() != null ? q.getAnsweredBy().getFullName() : null)
                .createdAt(q.getCreatedAt())
                .answeredAt(q.getAnsweredAt())
                .build();
    }
}
