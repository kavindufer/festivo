package com.festivo.admin.dto;

import java.time.YearMonth;

public record AnalyticsDataPoint(YearMonth period, long value) {}

