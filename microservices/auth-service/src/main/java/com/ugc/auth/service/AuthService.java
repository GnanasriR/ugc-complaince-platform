package com.ugc.auth.service;

import com.ugc.auth.dto.*;
import com.ugc.auth.entity.AuditLogEntity;
import com.ugc.auth.entity.OtpVerificationEntity;
import com.ugc.auth.entity.UserEntity;
import com.ugc.auth.enums.Role;
import com.ugc.auth.repository.AuditLogRepository;
import com.ugc.auth.repository.OtpVerificationRepository;
import com.ugc.auth.repository.UserRepository;
import com.ugc.auth.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final OtpVerificationRepository otpRepository;
    private final AuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public MapResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Account already exists. Try login.");
        }
        if (userRepository.existsByMobileNumber(request.getMobileNumber())) {
            throw new IllegalArgumentException("Mobile number is already registered.");
        }

        UserEntity user = UserEntity.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .mobileNumber(request.getMobileNumber())
                .institutionName(request.getInstitutionName())
                .role(request.getRole())
                .status("PENDING_VERIFICATION")
                .build();

        userRepository.save(user);

        // Generate 6-digit OTP
        String otpCode = String.format("%06d", new Random().nextInt(900000) + 100000);
        OtpVerificationEntity otp = OtpVerificationEntity.builder()
                .mobileNumber(request.getMobileNumber())
                .otpCode(otpCode)
                .expiresAt(LocalDateTime.now().plusMinutes(5))
                .isUsed(false)
                .build();
        otpRepository.save(otp);

        return new MapResponse("Registration successful. OTP sent to mobile number: " + request.getMobileNumber(), otpCode);
    }

    public AuthResponse verifyOtp(VerifyOtpRequest request) {
        OtpVerificationEntity otp = otpRepository.findTopByMobileNumberAndIsUsedFalseOrderByExpiresAtDesc(request.getMobileNumber())
                .orElseThrow(() -> new IllegalArgumentException("OTP expired or invalid. Click Resend."));

        if (otp.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("OTP expired. Click Resend.");
        }

        if (!otp.getOtpCode().equals(request.getOtpCode())) {
            otp.setFailedAttempts(otp.getFailedAttempts() + 1);
            otpRepository.save(otp);
            throw new IllegalArgumentException("Incorrect OTP code.");
        }

        otp.setIsUsed(true);
        otpRepository.save(otp);

        UserEntity user = userRepository.findAll().stream()
                .filter(u -> request.getMobileNumber().equals(u.getMobileNumber()))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("User record not found for mobile number."));

        user.setStatus("ACTIVE");
        UserEntity savedUser = userRepository.save(user);

        String token = tokenProvider.generateToken(savedUser.getEmail(), savedUser.getRole().name(), savedUser.getFullName());

        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .user(mapToDto(savedUser))
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        UserEntity user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials."));

        if ("SUSPENDED".equalsIgnoreCase(user.getStatus())) {
            throw new IllegalArgumentException("Account suspended. Contact admin.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            user.setFailedLoginAttempts(user.getFailedLoginAttempts() + 1);
            if (user.getFailedLoginAttempts() >= 5) {
                user.setLockUntil(LocalDateTime.now().plusMinutes(15));
            }
            userRepository.save(user);
            throw new IllegalArgumentException("Invalid credentials.");
        }

        user.setFailedLoginAttempts(0);
        userRepository.save(user);

        String token = tokenProvider.generateToken(user.getEmail(), user.getRole().name(), user.getFullName());

        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .user(mapToDto(user))
                .build();
    }

    public MapResponse forgotPassword(ForgotPasswordRequest request) {
        UserEntity user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("No account with this email."));

        String otpCode = String.format("%06d", new Random().nextInt(900000) + 100000);
        OtpVerificationEntity otp = OtpVerificationEntity.builder()
                .mobileNumber(user.getMobileNumber())
                .otpCode(otpCode)
                .expiresAt(LocalDateTime.now().plusMinutes(5))
                .isUsed(false)
                .build();
        otpRepository.save(otp);

        return new MapResponse("Password reset OTP sent to registered mobile.", user.getMobileNumber());
    }

    public MapResponse resetPassword(ResetPasswordRequest request) {
        OtpVerificationEntity otp = otpRepository.findTopByMobileNumberAndIsUsedFalseOrderByExpiresAtDesc(request.getMobileNumber())
                .orElseThrow(() -> new IllegalArgumentException("OTP expired or invalid."));

        if (!otp.getOtpCode().equals(request.getOtpCode())) {
            throw new IllegalArgumentException("Incorrect OTP code.");
        }

        otp.setIsUsed(true);
        otpRepository.save(otp);

        UserEntity user = userRepository.findAll().stream()
                .filter(u -> request.getMobileNumber().equals(u.getMobileNumber()))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("User not found."));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        return new MapResponse("Password reset successfully. Please login with your new password.", null);
    }

    public UserDto changeRole(Long userId, RoleChangeRequest request, Long adminId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found."));

        String oldRole = user.getRole().name();
        user.setRole(request.getNewRole());
        UserEntity updated = userRepository.save(user);

        AuditLogEntity audit = AuditLogEntity.builder()
                .adminUserId(adminId)
                .targetUserId(userId)
                .oldRole(oldRole)
                .newRole(request.getNewRole().name())
                .action("ROLE_CHANGE")
                .build();
        auditLogRepository.save(audit);

        return mapToDto(updated);
    }

    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream().map(this::mapToDto).toList();
    }

    public UserDto getUserByEmail(String email) {
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + email));
        return mapToDto(user);
    }

    public boolean validateToken(String token) {
        return tokenProvider.validateToken(token);
    }

    private UserDto mapToDto(UserEntity user) {
        return UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .mobileNumber(user.getMobileNumber())
                .institutionName(user.getInstitutionName())
                .role(user.getRole())
                .status(user.getStatus())
                .createdAt(user.getCreatedAt())
                .build();
    }

    public record MapResponse(String message, String data) {}
}
