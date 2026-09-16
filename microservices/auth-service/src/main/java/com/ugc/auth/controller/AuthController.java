package com.ugc.auth.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ugc.auth.dto.AuthResponse;
import com.ugc.auth.dto.ForgotPasswordRequest;
import com.ugc.auth.dto.LoginRequest;
import com.ugc.auth.dto.RegisterRequest;
import com.ugc.auth.dto.ResetPasswordRequest;
import com.ugc.auth.dto.RoleChangeRequest;
import com.ugc.auth.dto.UserDto;
import com.ugc.auth.dto.VerifyOtpRequest;
import com.ugc.auth.service.AuthService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.CrossOrigin;

@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = "*", allowedHeaders = "*")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<AuthResponse> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        return ResponseEntity.ok(authService.verifyOtp(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, Object>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        return ResponseEntity.ok(authService.forgotPassword(request));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, Object>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        return ResponseEntity.ok(authService.resetPassword(request));
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        return ResponseEntity.ok(authService.getAllUsers());
    }

    @PutMapping("/users/{userId}/role")
    public ResponseEntity<UserDto> changeUserRole(
            @PathVariable("userId") Long userId,
            @Valid @RequestBody RoleChangeRequest request,
            @RequestHeader(name = "X-Admin-Id", defaultValue = "1") Long adminId) {
        return ResponseEntity.ok(authService.changeRole(userId, request, adminId));
    }

    @PostMapping("/users/{userId}/approve")
    public ResponseEntity<UserDto> approveUser(
            @PathVariable("userId") String userId,
            @RequestBody(required = false) Map<String, Object> body) {
        String email = body != null && body.containsKey("email") ? String.valueOf(body.get("email")) : null;
        return ResponseEntity.ok(authService.approveUser(userId, email, body));
    }

    @PostMapping("/users/{userId}/reject")
    public ResponseEntity<UserDto> rejectUser(
            @PathVariable("userId") String userId,
            @RequestBody(required = false) Map<String, Object> body) {
        String email = body != null && body.containsKey("email") ? String.valueOf(body.get("email")) : null;
        return ResponseEntity.ok(authService.rejectUser(userId, email, body));
    }

    @PostMapping("/validate")
    public ResponseEntity<Map<String, Object>> validateToken(
            @RequestParam(value = "token", required = false) String token) {

        if (token == null || token.isBlank()) {
            return ResponseEntity.badRequest().body(
                    Map.of(
                            "valid", false,
                            "message", "Token is required"
                    )
            );
        }

        boolean valid = authService.validateToken(token);

        return ResponseEntity.ok(
                Map.of("valid", valid)
        );
    }

    @GetMapping("/me")
    public ResponseEntity<UserDto> getCurrentUser(
            Authentication authentication) {

        String email = authentication != null ? authentication.getName() : "user@institution.ac.in";

        return ResponseEntity.ok(
                authService.getCurrentUser(email)
        );
    }
}
