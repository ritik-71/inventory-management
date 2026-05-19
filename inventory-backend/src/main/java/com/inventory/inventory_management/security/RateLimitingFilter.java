package com.inventory.inventory_management.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.inventory.inventory_management.dto.ApiResponse;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class RateLimitingFilter implements Filter {

    private final ConcurrentHashMap<String, RateLimitBucket> globalLimits = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, RateLimitBucket> loginLimits = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${spring.profiles.active:dev}")
    private String activeProfile;

    private static final long TIME_WINDOW_MS = 60000; 

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws ServletException, IOException {
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        String ip = getClientIP(httpRequest);
        String uri = httpRequest.getRequestURI();

        // 1. Dynamically configure limits based on active profile (relaxed in dev/testing, strict in prod)
        boolean isProd = activeProfile != null && activeProfile.toLowerCase().contains("prod");
        int maxGlobalRequests = isProd ? 100 : 1000;
        int maxLoginRequests = isProd ? 5 : 100; // relaxed limit of 100/min in dev/test, strict 5/min in prod

        // 2. Enforce global API rate limit
        if (uri.startsWith("/api/")) {
            RateLimitBucket globalBucket = globalLimits.computeIfAbsent(ip, k -> new RateLimitBucket());
            if (!globalBucket.allowRequest(maxGlobalRequests)) {
                long secondsLeft = globalBucket.getSecondsRemaining();
                sendErrorResponse(httpResponse, "Rate limit exceeded. Maximum " + maxGlobalRequests + " requests per minute allowed. Please retry in " + secondsLeft + " seconds.", secondsLeft);
                return;
            }
        }

        // 3. Enforce brute-force protection on auth endpoints
        if (uri.equals("/api/auth/login") || uri.equals("/api/auth/register") || uri.equals("/api/auth/refresh")) {
            RateLimitBucket loginBucket = loginLimits.computeIfAbsent(ip, k -> new RateLimitBucket());
            if (!loginBucket.allowRequest(maxLoginRequests)) {
                long secondsLeft = loginBucket.getSecondsRemaining();
                sendErrorResponse(httpResponse, "Too many authentication attempts. Brute force security is active. Please retry in " + secondsLeft + " seconds.", secondsLeft);
                return;
            }
        }

        chain.doFilter(request, response);
    }

    private String getClientIP(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0];
    }

    private void sendErrorResponse(HttpServletResponse response, String message, long retryAfterSeconds) throws IOException {
        response.setStatus(429); // HTTP 429 Too Many Requests
        response.setContentType("application/json");
        response.setHeader("Retry-After", String.valueOf(retryAfterSeconds));
        
        ApiResponse<Object> apiResponse = new ApiResponse<>(false, message, null);
        response.getWriter().write(objectMapper.writeValueAsString(apiResponse));
    }

    private static class RateLimitBucket {
        private long windowStart = System.currentTimeMillis();
        private final AtomicInteger count = new AtomicInteger(0);

        public synchronized boolean allowRequest(int maxRequests) {
            long now = System.currentTimeMillis();
            if (now - windowStart > TIME_WINDOW_MS) {
                windowStart = now;
                count.set(0);
            }
            return count.incrementAndGet() <= maxRequests;
        }

        public long getSecondsRemaining() {
            long elapsed = System.currentTimeMillis() - windowStart;
            long remainingMs = Math.max(0, TIME_WINDOW_MS - elapsed);
            return (remainingMs / 1000) + 1;
        }
    }
}
