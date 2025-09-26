package com.festivo.admin.dto;

public record SystemSettingsDto(
    boolean maintenanceMode,
    boolean registrationsEnabled,
    boolean reviewsEnabled,
    boolean messagingEnabled,
    boolean paymentsEnabled) {}

