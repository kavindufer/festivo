package com.festivo.admin;

import com.festivo.admin.dto.AnalyticsDataPoint;
import com.festivo.common.security.Roles;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/analytics")
@PreAuthorize("hasAuthority('" + Roles.ADMIN + "')")
public class AdminAnalyticsController {
  private final AdminAnalyticsService analyticsService;

  @GetMapping("/registrations")
  public List<AnalyticsDataPoint> registrations(@RequestParam(defaultValue = "6") int months) {
    return analyticsService.registrationsTrend(normalizeWindow(months));
  }

  @GetMapping("/bookings")
  public List<AnalyticsDataPoint> bookings(@RequestParam(defaultValue = "6") int months) {
    return analyticsService.bookingsTrend(normalizeWindow(months));
  }

  @GetMapping("/revenue")
  public List<AnalyticsDataPoint> revenue(@RequestParam(defaultValue = "6") int months) {
    return analyticsService.revenueTrend(normalizeWindow(months));
  }

  private int normalizeWindow(int months) {
    return Math.max(1, Math.min(months, 24));
  }
}

