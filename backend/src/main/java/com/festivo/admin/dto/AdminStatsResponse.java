package com.festivo.admin.dto;

import java.math.BigDecimal;

public record AdminStatsResponse(
    long totalUsers, long totalBookings, BigDecimal totalRevenue, double averageVendorRating) {}

