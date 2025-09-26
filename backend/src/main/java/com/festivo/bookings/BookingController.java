package com.festivo.bookings;

import com.festivo.common.security.Roles;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/bookings")
public class BookingController {
  private final BookingService bookingService;

  @PostMapping
  @PreAuthorize("hasAuthority('" + Roles.ORGANIZER + "')")
  public Booking create(@Valid @RequestBody BookingRequest request) {
    return bookingService.create(
        request.vendorId(),
        request.serviceId(),
        request.organizerId(),
        request.startTime(),
        request.endTime(),
        request.totalAmount(),
        request.depositAmount(),
        request.currency(),
        request.notes(),
        request.timezone());
  }

  @GetMapping("/organizer/{organizerId}")
  @PreAuthorize("hasAnyAuthority('" + Roles.ORGANIZER + "','" + Roles.ADMIN + "')")
  public List<Booking> organizer(@PathVariable Long organizerId) {
    return bookingService.forOrganizer(organizerId);
  }

  @GetMapping("/vendor/{vendorId}")
  @PreAuthorize("hasAnyAuthority('" + Roles.VENDOR + "','" + Roles.ADMIN + "')")
  public List<Booking> vendor(@PathVariable Long vendorId) {
    return bookingService.forVendor(vendorId);
  }

  @PostMapping("/{id}/confirm")
  @PreAuthorize("hasAnyAuthority('" + Roles.VENDOR + "','" + Roles.ADMIN + "')")
  public Booking confirm(@PathVariable Long id) {
    return bookingService.confirm(id);
  }

  @PostMapping("/{id}/cancel")
  @PreAuthorize("hasAnyAuthority('" + Roles.ORGANIZER + "','" + Roles.ADMIN + "')")
  public Booking cancel(@PathVariable Long id) {
    return bookingService.cancel(id);
  }

  @GetMapping("/availability")
  public Map<String, Boolean> availability(
      @RequestParam Long vendorId,
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime start,
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime end) {
    boolean available = !bookingService.hasConflictingBooking(vendorId, start, end);
    return Map.of("available", available);
  }

  public record BookingRequest(
      @NotNull Long vendorId,
      @NotNull Long serviceId,
      @NotNull Long organizerId,
      @NotNull @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime startTime,
      @NotNull @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime endTime,
      @NotNull BigDecimal totalAmount,
      BigDecimal depositAmount,
      @NotNull String currency,
      String notes,
      @NotNull String timezone) {}
}
