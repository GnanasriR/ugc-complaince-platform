package com.ugc.auth.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "otp_verifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OtpVerificationEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String mobileNumber;

    @Column(nullable = false)
    private String otpCode;

    private Integer failedAttempts;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    private Boolean isUsed;

    @PrePersist
    protected void onCreate() {
        if (this.failedAttempts == null) {
            this.failedAttempts = 0;
        }
        if (this.isUsed == null) {
            this.isUsed = false;
        }
    }
}
