package com.festivo.admin.dto;

import java.util.List;

public record PagedResponse<T>(List<T> content, long totalElements, int totalPages, int page, int size) {}

