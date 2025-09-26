package com.festivo.admin.dto;

import com.festivo.users.UserRole;
import java.time.Instant;

public record AdminUserSummary(
    Long id, String displayName, String email, UserRole role, boolean active, Instant createdAt) {}

