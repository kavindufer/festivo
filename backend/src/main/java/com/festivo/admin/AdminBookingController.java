package com.festivo.admin;

import com.festivo.admin.dto.AdminBookingSummary;
import com.festivo.admin.dto.PagedResponse;
import com.festivo.bookings.BookingStatus;
import com.festivo.common.security.Roles;
import java.time.OffsetDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/bookings")
@PreAuthorize("hasAuthority('" + Roles.ADMIN + "')")
public class AdminBookingController {
  private final AdminBookingService bookingService;

  @GetMapping
  public PagedResponse<AdminBookingSummary> list(
      @RequestParam(required = false) BookingStatus status,
      @RequestParam(required = false) Long vendorId,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime start,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime end,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size,
      @RequestParam(required = false) String sort) {
    return bookingService.search(status, vendorId, start, end, Math.max(page, 0), Math.max(1, Math.min(size, 100)), sort);
  }

  @GetMapping("/{id}")
  public AdminBookingSummary get(@PathVariable Long id) {
    return bookingService.get(id);
  }

  @PutMapping("/{id}/cancel")
  public AdminBookingSummary cancel(@PathVariable Long id) {
    return bookingService.cancel(id);
  }
}

