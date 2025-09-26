package com.festivo.services;

import com.festivo.bookings.BookingService;
import com.festivo.common.security.Roles;
import com.festivo.payments.PaymentRepository;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/dashboard")
@PreAuthorize("hasAnyAuthority('" + Roles.ORGANIZER + "','" + Roles.ADMIN + "')")
public class PlannerDashboardController {
  private final BookingService bookingService;
  private final PaymentRepository paymentRepository;

  @GetMapping
  public Map<String, Object> summary(@RequestParam Long organizerId) {
    var bookings = bookingService.forOrganizer(organizerId);
    var upcoming =
        bookings.stream()
            .filter(b -> b.getStatus() != com.festivo.bookings.BookingStatus.CANCELLED)
            .sorted(java.util.Comparator.comparing(com.festivo.bookings.Booking::getStartTime))
            .limit(5)
            .collect(Collectors.toList());
    var paymentCount =
        paymentRepository.findByBookingIdIn(
                bookings.stream().map(com.festivo.bookings.Booking::getId).toList())
            .size();
    return Map.of(
        "upcoming", upcoming,
        "counts", Map.of("totalBookings", bookings.size(), "payments", paymentCount));
  }
}
