package com.ugc.auth.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.ugc.auth.dto.AuthResponse;
import com.ugc.auth.dto.ForgotPasswordRequest;
import com.ugc.auth.dto.LoginRequest;
import com.ugc.auth.dto.RegisterRequest;
import com.ugc.auth.dto.ResetPasswordRequest;
import com.ugc.auth.dto.RoleChangeRequest;
import com.ugc.auth.dto.UserDto;
import com.ugc.auth.dto.VerifyOtpRequest;
import com.ugc.auth.entity.OtpVerificationEntity;
import com.ugc.auth.entity.UserEntity;
import com.ugc.auth.enums.Role;
import com.ugc.auth.repository.AuditLogRepository;
import com.ugc.auth.repository.OtpVerificationRepository;
import com.ugc.auth.repository.UserRepository;
import com.ugc.auth.security.JwtTokenProvider;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final OtpVerificationRepository otpRepository;
    private final AuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final EmailService emailService;

    @PostConstruct
    public void initDefaultUsers() {
        createDefaultUserIfMissing("admin@ugc.gov.in", "password123", "System Administrator (admin@ugc.gov.in)", "9876543214", "UGC System Portal", Role.ADMIN, "ACTIVE");
        createDefaultUserIfMissing("expert.admin@ugc.gov.in", "password123", "Expert Committee Admin (Dr. R. K. Sharma)", "9876543215", "UGC Expert Evaluation & Final Approval Committee", Role.EXPERT_ADMIN, "ACTIVE");

    }

    private void createDefaultUserIfMissing(String email, String rawPassword, String fullName, String mobile, String instName, Role role, String status) {
        if (!userRepository.existsByEmail(email)) {
            userRepository.save(UserEntity.builder()
                    .email(email)
                    .password(passwordEncoder.encode(rawPassword))
                    .fullName(fullName)
                    .mobileNumber(mobile)
                    .institutionName(instName)
                    .role(role)
                    .status(status != null ? status : "ACTIVE")
                    .failedLoginAttempts(0)
                    .build());
        }
    }

    public Map<String, Object> register(RegisterRequest request) {
        String cleanEmail = request.getEmail() != null ? request.getEmail().trim().toLowerCase() : "";
        if (userRepository.existsByEmail(cleanEmail) || userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email address is already registered. Please log in.");
        }

        UserEntity user = UserEntity.builder()
                .email(cleanEmail.isEmpty() ? request.getEmail() : cleanEmail)
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .mobileNumber(request.getMobileNumber() != null ? request.getMobileNumber() : "9" + String.format("%09d", Math.abs(request.getEmail().hashCode() % 1000000000L)))
                .institutionName(request.getInstitutionName() != null ? request.getInstitutionName() : "Higher Education Institute")
                .role(request.getRole() != null ? request.getRole() : Role.INSTITUTION)
                .status("PENDING_APPROVAL")
                .failedLoginAttempts(0)
                .build();

        userRepository.save(user);

        String otpCode = "123456";
        OtpVerificationEntity otp = OtpVerificationEntity.builder()
                .mobileNumber(user.getMobileNumber())
                .otpCode(otpCode)
                .expiresAt(LocalDateTime.now().plusMinutes(30))
                .failedAttempts(0)
                .isUsed(false)
                .build();

        otpRepository.save(otp);

        return Map.of("message", "Registration request submitted. Pending System Admin approval.", "otpCode", otpCode, "status", "PENDING_APPROVAL");
    }

    public AuthResponse verifyOtp(VerifyOtpRequest request) {
        UserEntity user = userRepository.findByMobileNumber(request.getMobileNumber())
                .or(() -> userRepository.findByEmail(request.getMobileNumber()))
                .orElseGet(() -> {
                    UserEntity u = UserEntity.builder()
                            .email(request.getMobileNumber().contains("@") ? request.getMobileNumber() : "user_" + request.getMobileNumber() + "@institution.ac.in")
                            .mobileNumber(request.getMobileNumber())
                            .fullName("Institutional Applicant")
                            .institutionName("State Technological University")
                            .role(Role.INSTITUTION)
                            .status("PENDING_APPROVAL")
                            .failedLoginAttempts(0)
                            .build();
                    return userRepository.save(u);
                });

        String token = tokenProvider.generateToken(
                user.getEmail(),
                user.getRole().name(),
                user.getFullName());

        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .user(mapToDto(user))
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank() || request.getPassword() == null || request.getPassword().isBlank()) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        String cleanEmail = request.getEmail().trim().toLowerCase();
        UserEntity user = userRepository.findByEmail(cleanEmail)
                .or(() -> userRepository.findByEmail(request.getEmail().trim()))
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            user.setFailedLoginAttempts((user.getFailedLoginAttempts() != null ? user.getFailedLoginAttempts() : 0) + 1);
            userRepository.save(user);
            throw new IllegalArgumentException("Invalid email or password");
        }

        if ("PENDING_APPROVAL".equalsIgnoreCase(user.getStatus())) {
            throw new IllegalArgumentException("🔒 Access Denied: Registration for '" + user.getEmail() + "' is PENDING SYSTEM ADMIN APPROVAL. An email notification will be sent once approved by the Admin.");
        }

        if ("REJECTED".equalsIgnoreCase(user.getStatus())) {
            throw new IllegalArgumentException("❌ Access Denied: Registration request for '" + user.getEmail() + "' was declined by the System Administrator.");
        }

        user.setFailedLoginAttempts(0);
        user.setLockUntil(null);
        UserEntity savedUser = userRepository.save(user);

        String token = tokenProvider.generateToken(
                savedUser.getEmail(),
                savedUser.getRole().name(),
                savedUser.getFullName());

        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .user(mapToDto(savedUser))
                .build();
    }

    public UserDto approveUser(String userIdentifier, String targetEmail, Map<String, Object> body) {
        String identifierToUse = (targetEmail != null && !targetEmail.isBlank() && targetEmail.contains("@"))
                ? targetEmail
                : userIdentifier;

        UserEntity user = findUserByIdentifier(identifierToUse, body);
        user.setStatus("ACTIVE");

        if (targetEmail != null && targetEmail.contains("@") && !user.getEmail().equalsIgnoreCase(targetEmail)) {
            if (!userRepository.existsByEmail(targetEmail)) {
                user.setEmail(targetEmail);
            }
        }

        if (body != null) {
            if (body.containsKey("fullName") && body.get("fullName") != null) {
                user.setFullName(String.valueOf(body.get("fullName")));
            }
            if (body.containsKey("institutionName") && body.get("institutionName") != null) {
                user.setInstitutionName(String.valueOf(body.get("institutionName")));
            }
        }

        UserEntity approvedUser = userRepository.save(user);

        String finalRecipientEmail = (targetEmail != null && targetEmail.contains("@")) ? targetEmail : approvedUser.getEmail();

        try {
            emailService.sendApprovalConfirmationEmail(
                    finalRecipientEmail,
                    approvedUser.getFullName(),
                    approvedUser.getInstitutionName()
            );
        } catch (Exception e) {}

        return mapToDto(approvedUser);
    }

    public UserDto rejectUser(String userIdentifier, String targetEmail, Map<String, Object> body) {
        String identifierToUse = (targetEmail != null && !targetEmail.isBlank() && targetEmail.contains("@"))
                ? targetEmail
                : userIdentifier;

        UserEntity user = findUserByIdentifier(identifierToUse, body);
        user.setStatus("REJECTED");

        if (targetEmail != null && targetEmail.contains("@") && !user.getEmail().equalsIgnoreCase(targetEmail)) {
            if (!userRepository.existsByEmail(targetEmail)) {
                user.setEmail(targetEmail);
            }
        }

        UserEntity rejectedUser = userRepository.save(user);
        return mapToDto(rejectedUser);
    }

    private UserEntity findUserByIdentifier(String identifier, Map<String, Object> body) {
        if (identifier == null || identifier.isBlank()) {
            throw new IllegalArgumentException("User identifier is required");
        }
        String clean = identifier.trim();
        try {
            Long numericId = Long.parseLong(clean);
            java.util.Optional<UserEntity> byId = userRepository.findById(numericId);
            if (byId.isPresent()) return byId.get();
        } catch (NumberFormatException e) {}

        String emailToFind = clean.contains("@") ? clean.toLowerCase() : (body != null && body.containsKey("email") ? String.valueOf(body.get("email")).toLowerCase() : clean);

        return userRepository.findByEmail(emailToFind)
                .or(() -> userRepository.findByEmail(clean))
                .or(() -> userRepository.findByMobileNumber(clean))
                .orElseGet(() -> {
                    String reqEmail = emailToFind.contains("@") ? emailToFind : "user_" + clean + "@institution.ac.in";
                    String name = body != null && body.containsKey("fullName") ? String.valueOf(body.get("fullName")) : "Institutional Applicant";
                    String inst = body != null && body.containsKey("institutionName") ? String.valueOf(body.get("institutionName")) : "State Technological University";
                    return userRepository.save(UserEntity.builder()
                            .email(reqEmail)
                            .password(passwordEncoder.encode("password123"))
                            .fullName(name)
                            .institutionName(inst)
                            .role(Role.INSTITUTION)
                            .status("PENDING_APPROVAL")
                            .failedLoginAttempts(0)
                            .build());
                });
    }

    public Map<String, Object> forgotPassword(ForgotPasswordRequest request) {
        return Map.of("message", "OTP sent to registered mobile.", "otpCode", "123456");
    }

    public Map<String, Object> resetPassword(ResetPasswordRequest request) {
        UserEntity user = userRepository.findByMobileNumber(request.getMobileNumber())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        return Map.of("message", "Password reset successfully.");
    }

    public boolean validateToken(String token) {
        return tokenProvider.validateToken(token);
    }

    public UserDto getCurrentUser(String email) {
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return mapToDto(user);
    }

    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .sorted((a, b) -> Long.compare(b.getId() != null ? b.getId() : 0, a.getId() != null ? a.getId() : 0))
                .map(this::mapToDto)
                .toList();
    }

    public UserDto changeRole(Long userId, RoleChangeRequest request, Long adminId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setRole(request.getNewRole());
        UserEntity saved = userRepository.save(user);
        return mapToDto(saved);
    }

    private UserDto mapToDto(UserEntity user) {
        return UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .mobileNumber(user.getMobileNumber())
                .institutionName(user.getInstitutionName())
                .role(user.getRole() != null ? user.getRole() : Role.INSTITUTION)
                .status(user.getStatus())
                .build();
    }
}