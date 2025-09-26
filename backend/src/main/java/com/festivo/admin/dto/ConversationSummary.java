package com.festivo.admin.dto;

import java.time.Instant;

public record ConversationSummary(
    Long bookingId,
    String vendorName,
    String lastMessageSnippet,
    String lastSender,
    Instant lastMessageAt,
    long totalMessages) {}

