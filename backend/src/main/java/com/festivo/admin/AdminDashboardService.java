package com.festivo.admin;

import com.festivo.admin.dto.AdminBookingSummary;
import com.festivo.admin.dto.AdminStatsResponse;
import com.festivo.admin.dto.AdminUserSummary;
import com.festivo.bookings.Booking;
import com.festivo.bookings.BookingRepository;
import com.festivo.payments.PaymentRepository;
import com.festivo.payments.PaymentStatus;
import com.festivo.users.User;
import com.festivo.users.UserRepository;
import com.festivo.vendors.ReviewRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminDashboardService {
  private final UserRepository userRepository;
  private final BookingRepository bookingRepository;
  private final PaymentRepository paymentRepository;
  private final ReviewRepository reviewRepository;

  public AdminStatsResponse getStats() {
    long totalUsers = userRepository.count();
    long totalBookings = bookingRepository.count();

    BigDecimal totalRevenue =
        paymentRepository.findAll().stream()
            .filter(payment -> payment.getStatus() == PaymentStatus.PAID)
            .map(payment -> payment.getAmount() != null ? payment.getAmount() : BigDecimal.ZERO)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

    Double rating = reviewRepository.calculateGlobalAverageRating();
    double averageRating = rating != null ? BigDecimal.valueOf(rating).setScale(2, RoundingMode.HALF_UP).doubleValue() : 0d;

    return new AdminStatsResponse(totalUsers, totalBookings, totalRevenue, averageRating);
  }

  public List<AdminUserSummary> getRecentUsers(int limit) {
    return userRepository
        .findAll(PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "createdAt")))
        .stream()
        .map(this::toUserSummary)
        .collect(Collectors.toList());
  }

  public List<AdminBookingSummary> getRecentBookings(int limit) {
    return bookingRepository
        .findAll(PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "createdAt")))
        .stream()
        .map(this::toBookingSummary)
        .collect(Collectors.toList());
  }

  private AdminUserSummary toUserSummary(User user) {
    return new AdminUserSummary(
        user.getId(), user.getDisplayName(), user.getEmail(), user.getRole(), user.isActive(), user.getCreatedAt());
  }

  private AdminBookingSummary toBookingSummary(Booking booking) {
    return new AdminBookingSummary(
        booking.getId(),
        booking.getVendor() != null ? booking.getVendor().getId() : null,
        booking.getVendor() != null ? booking.getVendor().getName() : null,
        booking.getStatus(),
        booking.getTotalAmount(),
        booking.getStartTime(),
        booking.getEndTime());
  }
}

