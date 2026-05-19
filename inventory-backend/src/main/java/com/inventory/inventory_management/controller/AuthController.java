package com.inventory.inventory_management.controller;

import com.inventory.inventory_management.security.JwtTokenProvider;
import com.inventory.inventory_management.entity.User;
import com.inventory.inventory_management.dto.RegisterDTO;
import com.inventory.inventory_management.exception.BadRequestException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.ResponseCookie;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private com.inventory.inventory_management.repository.UserRepository userRepository;

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private com.inventory.inventory_management.repository.RefreshTokenRepository refreshTokenRepository;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody Map<String, String> loginRequest, HttpServletResponse response) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.get("email"),
                        loginRequest.get("password")
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String email = loginRequest.get("email");
        String accessToken = tokenProvider.generateAccessToken(email);
        String refreshToken = tokenProvider.generateRefreshToken(email);

        // Persist refresh token
        com.inventory.inventory_management.entity.RefreshToken rt = new com.inventory.inventory_management.entity.RefreshToken();
        rt.setToken(refreshToken);
        rt.setUserEmail(email);
        rt.setExpiryDate(java.time.Instant.now().plusMillis(604800000)); // 7 days
        refreshTokenRepository.save(rt);

        // Set HttpOnly Cookies
        setCookies(response, accessToken, refreshToken);
        
        // Retrieve persistent user details
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User not found with email: " + email));
        
        Map<String, Object> responseData = new HashMap<>();
        responseData.put("token", accessToken);
        responseData.put("email", email);
        responseData.put("name", user.getName());
        responseData.put("role", user.getRole());
        responseData.put("message", "Login successful");
        
        return ResponseEntity.ok(responseData);
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterDTO registerDTO, HttpServletResponse response) {
        if (userRepository.findByEmail(registerDTO.getEmail()).isPresent()) {
            throw new BadRequestException("Email address is already in use.");
        }

        User user = new User();
        user.setName(registerDTO.getName());
        user.setEmail(registerDTO.getEmail());
        user.setPassword(passwordEncoder.encode(registerDTO.getPassword()));
        user.setRole("ROLE_USER");

        userRepository.save(user);

        // Auto-login newly registered user
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        registerDTO.getEmail(),
                        registerDTO.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        
        String accessToken = tokenProvider.generateAccessToken(user.getEmail());
        String refreshToken = tokenProvider.generateRefreshToken(user.getEmail());

        // Persist refresh token
        com.inventory.inventory_management.entity.RefreshToken rt = new com.inventory.inventory_management.entity.RefreshToken();
        rt.setToken(refreshToken);
        rt.setUserEmail(user.getEmail());
        rt.setExpiryDate(java.time.Instant.now().plusMillis(604800000)); // 7 days
        refreshTokenRepository.save(rt);

        // Set HttpOnly Cookies
        setCookies(response, accessToken, refreshToken);

        Map<String, Object> responseData = new HashMap<>();
        responseData.put("token", accessToken);
        responseData.put("email", user.getEmail());
        responseData.put("name", user.getName());
        responseData.put("role", user.getRole());
        responseData.put("message", "User registered successfully");

        return ResponseEntity.ok(responseData);
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshSession(HttpServletRequest request, HttpServletResponse response) {
        String refreshToken = null;
        
        // 1. Try Cookie
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("refresh_token".equals(cookie.getName())) {
                    refreshToken = cookie.getValue();
                }
            }
        }
        
        // 2. Fallback to header if needed
        if (refreshToken == null) {
            String bearerToken = request.getHeader("Authorization");
            if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
                refreshToken = bearerToken.substring(7);
            }
        }
        
        if (refreshToken == null || !tokenProvider.validateToken(refreshToken)) {
            throw new BadRequestException("Invalid or expired refresh token. Please login again.");
        }

        // Validate against database revocation list
        com.inventory.inventory_management.entity.RefreshToken storedToken = refreshTokenRepository.findByToken(refreshToken)
                .orElseThrow(() -> new BadRequestException("Refresh token not found. Please login again."));

        if (storedToken.isRevoked() || storedToken.getExpiryDate().isBefore(java.time.Instant.now())) {
            throw new BadRequestException("Refresh token revoked or expired. Please login again.");
        }

        String email = tokenProvider.getEmailFromJWT(refreshToken);
        
        // Token Rotation: Revoke old token
        storedToken.setRevoked(true);
        refreshTokenRepository.save(storedToken);

        String newAccessToken = tokenProvider.generateAccessToken(email);
        String newRefreshToken = tokenProvider.generateRefreshToken(email);

        // Save new token
        com.inventory.inventory_management.entity.RefreshToken newRt = new com.inventory.inventory_management.entity.RefreshToken();
        newRt.setToken(newRefreshToken);
        newRt.setUserEmail(email);
        newRt.setExpiryDate(java.time.Instant.now().plusMillis(604800000));
        refreshTokenRepository.save(newRt);
        
        setCookies(response, newAccessToken, newRefreshToken);
        
        // Retrieve persistent user details
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User not found with email: " + email));
        
        Map<String, Object> responseData = new HashMap<>();
        responseData.put("token", newAccessToken);
        responseData.put("email", email);
        responseData.put("name", user.getName());
        responseData.put("role", user.getRole());
        responseData.put("message", "Session refreshed successfully");
        
        return ResponseEntity.ok(responseData);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser(HttpServletRequest request, HttpServletResponse response) {
        // Extract token to revoke
        String refreshToken = null;
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("refresh_token".equals(cookie.getName())) {
                    refreshToken = cookie.getValue();
                }
            }
        }
        if (refreshToken != null) {
            refreshTokenRepository.findByToken(refreshToken).ifPresent(rt -> {
                rt.setRevoked(true);
                refreshTokenRepository.save(rt);
            });
        }

        // Clear cookies by sending expired maxAge=0 headers
        ResponseCookie clearAccess = ResponseCookie.from("access_token", "")
                .httpOnly(true)
                .secure(true) // Required for SameSite=None
                .path("/")
                .maxAge(0)
                .sameSite("None") // Required for cross-origin deployment
                .build();

        ResponseCookie clearRefresh = ResponseCookie.from("refresh_token", "")
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(0)
                .sameSite("None")
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, clearAccess.toString());
        response.addHeader(HttpHeaders.SET_COOKIE, clearRefresh.toString());

        Map<String, String> responseData = new HashMap<>();
        responseData.put("message", "Logged out successfully");
        return ResponseEntity.ok(responseData);
    }

    private void setCookies(HttpServletResponse response, String accessToken, String refreshToken) {
        ResponseCookie accessCookie = ResponseCookie.from("access_token", accessToken)
                .httpOnly(true)
                .secure(true) // Enforced for cross-origin HTTPS deployments
                .path("/")
                .maxAge(900) // 15 mins
                .sameSite("None") // Permits Vercel to Render cookie exchange
                .build();

        ResponseCookie refreshCookie = ResponseCookie.from("refresh_token", refreshToken)
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(604800) // 7 days
                .sameSite("None")
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, accessCookie.toString());
        response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());
    }
}
