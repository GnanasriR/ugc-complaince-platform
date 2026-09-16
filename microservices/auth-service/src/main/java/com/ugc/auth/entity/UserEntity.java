package com.ugc.auth.entity;

import com.ugc.auth.enums.Role;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = true)
    private String mobileNumber;

    private String institutionName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50, columnDefinition = "VARCHAR(50)")
    private Role role;

    @Column(nullable = false)
    private String status; // PENDING_APPROVAL, ACTIVE, REJECTED

    private Integer failedLoginAttempts;

    private LocalDateTime lockUntil;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = "PENDING_APPROVAL";
        }
        if (this.failedLoginAttempts == null) {
            this.failedLoginAttempts = 0;
        }
    }
}
