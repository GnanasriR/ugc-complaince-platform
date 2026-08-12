package com.ugc.auth.repository;

import com.ugc.auth.entity.OtpVerificationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OtpVerificationRepository extends JpaRepository<OtpVerificationEntity, Long> {
    Optional<OtpVerificationEntity> findTopByMobileNumberAndIsUsedFalseOrderByExpiresAtDesc(String mobileNumber);
}
