package com.festivo.admin;

import com.festivo.admin.dto.AdminBookingSummary;
import com.festivo.admin.dto.AdminStatsResponse;
import com.festivo.admin.dto.AdminUserSummary;
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
@RequestMapping("/api/admin")
@PreAuthorize("hasAuthority('" + Roles.ADMIN + "')")
public class AdminDashboardController {
  private final AdminDashboardService dashboardService;

  @GetMapping("/stats")
  public AdminStatsResponse stats() {
    return dashboardService.getStats();
  }

  @GetMapping("/recent-users")
  public List<AdminUserSummary> recentUsers(@RequestParam(defaultValue = "5") int limit) {
    return dashboardService.getRecentUsers(Math.max(1, Math.min(limit, 25)));
  }

  @GetMapping("/recent-bookings")
  public List<AdminBookingSummary> recentBookings(@RequestParam(defaultValue = "5") int limit) {
    return dashboardService.getRecentBookings(Math.max(1, Math.min(limit, 25)));
  }
}

