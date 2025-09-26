package com.festivo.admin.dto;

import com.festivo.users.UserRole;

public record UpdateUserRequest(String displayName, String email, UserRole role, Boolean active, Boolean mfaEnabled) {}

