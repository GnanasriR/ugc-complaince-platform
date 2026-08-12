package com.ugc.auth.dto;

import com.ugc.auth.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private Long id;
    private String email;
    private String fullName;
    private String mobileNumber;
    private String institutionName;
    private Role role;
    private String status;
    private LocalDateTime createdAt;
}
