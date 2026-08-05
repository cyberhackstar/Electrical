package com.electromart.aspect;

import com.electromart.entity.AuditLog;
import com.electromart.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.stream.Collectors;

/**
 * Automatically logs every call into com.electromart.controller.admin.* — no need to
 * sprinkle logging calls through individual admin service methods. Captures who did what,
 * on which endpoint, and whether it succeeded, without blocking the actual request on failure
 * to write the log (logging failures are swallowed, never surfaced to the admin user).
 */
@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class AdminAuditAspect {

    private final AuditLogRepository auditLogRepository;

    private static final int MAX_DETAILS_LENGTH = 1500;

    @Around("execution(* com.electromart.controller.admin..*(..))")
    public Object logAdminAction(ProceedingJoinPoint joinPoint) throws Throwable {
        String action = joinPoint.getSignature().getDeclaringType().getSimpleName() + "." + joinPoint.getSignature().getName();
        String performedBy = getCurrentUserEmail();
        String details = summarizeArgs(joinPoint.getArgs());

        try {
            Object result = joinPoint.proceed();
            saveLog(performedBy, action, details, true);
            return result;
        } catch (Throwable ex) {
            saveLog(performedBy, action, details + " | ERROR: " + ex.getMessage(), false);
            throw ex;
        }
    }

    private void saveLog(String performedBy, String action, String details, boolean success) {
        try {
            AuditLog logEntry = AuditLog.builder()
                    .performedByEmail(performedBy)
                    .action(action)
                    .details(truncate(details))
                    .success(success)
                    .build();
            auditLogRepository.save(logEntry);
        } catch (Exception e) {
            log.warn("Failed to persist audit log for action {}: {}", action, e.getMessage());
        }
    }

    private String getCurrentUserEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return (auth != null && auth.getName() != null) ? auth.getName() : "unknown";
    }

    private String summarizeArgs(Object[] args) {
        if (args == null || args.length == 0) return "";
        return Arrays.stream(args)
                .filter(arg -> !(arg instanceof org.springframework.web.multipart.MultipartFile))
                .map(String::valueOf)
                .collect(Collectors.joining(", "));
    }

    private String truncate(String text) {
        if (text == null) return null;
        return text.length() > MAX_DETAILS_LENGTH ? text.substring(0, MAX_DETAILS_LENGTH) + "...[truncated]" : text;
    }
}
