package com.festivo.admin.dto;

import com.festivo.bookings.BookingStatus;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record AdminBookingSummary(
    Long id,
    Long vendorId,
    String vendorName,
    BookingStatus status,
    BigDecimal totalAmount,
    OffsetDateTime startTime,
    OffsetDateTime endTime) {}

