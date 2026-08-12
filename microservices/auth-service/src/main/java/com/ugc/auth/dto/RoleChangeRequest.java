package com.ugc.auth.dto;

import com.ugc.auth.enums.Role;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RoleChangeRequest {
    @NotNull(message = "Role is required")
    private Role newRole;
}
