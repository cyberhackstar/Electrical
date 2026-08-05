package com.electromart.controller.admin;

import com.electromart.dto.ApiResponse;
import com.electromart.dto.AuditLogResponse;
import com.electromart.dto.PagedResponse;
import com.electromart.entity.AuditLog;
import com.electromart.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin/audit-logs")
@RequiredArgsConstructor
public class AdminAuditLogController {

    private final AuditLogRepository auditLogRepository;

    @GetMapping
    public ApiResponse<PagedResponse<AuditLogResponse>> getAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {

        Pageable pageable = PageRequest.of(page, size);
        var result = auditLogRepository.findAllByOrderByTimestampDesc(pageable)
                .map(this::toResponse);

        return ApiResponse.success("Audit logs fetched", PagedResponse.from(result));
    }

    private AuditLogResponse toResponse(AuditLog log) {
        return AuditLogResponse.builder()
                .id(log.getId())
                .performedByEmail(log.getPerformedByEmail())
                .action(log.getAction())
                .details(log.getDetails())
                .success(log.isSuccess())
                .timestamp(log.getTimestamp())
                .build();
    }
}
