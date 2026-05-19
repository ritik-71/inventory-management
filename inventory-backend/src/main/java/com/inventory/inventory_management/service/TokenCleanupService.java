package com.inventory.inventory_management.service;

import com.inventory.inventory_management.repository.RefreshTokenRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
public class TokenCleanupService {

    private final RefreshTokenRepository refreshTokenRepository;

    public TokenCleanupService(RefreshTokenRepository refreshTokenRepository) {
        this.refreshTokenRepository = refreshTokenRepository;
    }

    /**
     * Runs every hour to purge expired and revoked refresh tokens.
     * Prevents the refresh_tokens table from growing unbounded on Render free-tier.
     */
    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void purgeExpiredTokens() {
        int deleted = refreshTokenRepository.deleteExpiredOrRevoked(Instant.now());
        if (deleted > 0) {
            System.out.println("[TokenCleanup] Purged " + deleted + " expired/revoked refresh tokens.");
        }
    }
}
