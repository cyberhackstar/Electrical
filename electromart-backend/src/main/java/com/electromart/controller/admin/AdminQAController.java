package com.electromart.controller.admin;

import com.electromart.dto.AnswerRequest;
import com.electromart.dto.ApiResponse;
import com.electromart.dto.QuestionResponse;
import com.electromart.security.CustomUserDetails;
import com.electromart.service.ProductQAService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/questions")
@RequiredArgsConstructor
public class AdminQAController {

    private final ProductQAService productQAService;

    @PutMapping("/{id}/answer")
    public ApiResponse<QuestionResponse> answerQuestion(
            @AuthenticationPrincipal CustomUserDetails principal,
            @PathVariable Long id,
            @Valid @RequestBody AnswerRequest request) {
        return ApiResponse.success("Answer submitted", productQAService.answerQuestion(principal.getUser(), id, request));
    }
}
