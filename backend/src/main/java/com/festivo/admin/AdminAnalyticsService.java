package com.festivo.admin;

import com.festivo.admin.dto.AnalyticsDataPoint;
import com.festivo.bookings.BookingRepository;
import com.festivo.payments.PaymentRepository;
import com.festivo.payments.PaymentStatus;
import com.festivo.users.UserRepository;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.YearMonth;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminAnalyticsService {
  private final UserRepository userRepository;
  private final BookingRepository bookingRepository;
  private final PaymentRepository paymentRepository;

  public List<AnalyticsDataPoint> registrationsTrend(int months) {
    return aggregateByMonth(
        months,
        userRepository
            .findAll()
            .stream()
            .map(user -> Map.entry(toYearMonth(user.getCreatedAt()), 1L))
            .toList());
  }

  public List<AnalyticsDataPoint> bookingsTrend(int months) {
    return aggregateByMonth(
        months,
        bookingRepository
            .findAll()
            .stream()
            .map(booking -> Map.entry(toYearMonth(booking.getCreatedAt()), 1L))
            .toList());
  }

  public List<AnalyticsDataPoint> revenueTrend(int months) {
    return aggregateByMonth(
        months,
        paymentRepository
            .findAll()
            .stream()
            .filter(payment -> payment.getStatus() == PaymentStatus.PAID)
            .map(
                payment -> {
                  BigDecimal amount = payment.getAmount() != null ? payment.getAmount() : BigDecimal.ZERO;
                  long cents = amount.multiply(BigDecimal.valueOf(100)).longValue();
                  return Map.entry(toYearMonth(payment.getCreatedAt()), cents);
                })
            .toList());
  }

  private List<AnalyticsDataPoint> aggregateByMonth(int months, List<Map.Entry<YearMonth, Long>> source) {
    YearMonth current = YearMonth.now(ZoneOffset.UTC);
    YearMonth start = current.minusMonths(months - 1L);
    Map<YearMonth, Long> accumulator = new TreeMap<>();
    for (YearMonth cursor = start; !cursor.isAfter(current); cursor = cursor.plusMonths(1)) {
      accumulator.put(cursor, 0L);
    }

    for (Map.Entry<YearMonth, Long> entry : source) {
      YearMonth period = entry.getKey();
      if (period == null) {
        continue;
      }
      if (!period.isBefore(start) && !period.isAfter(current)) {
        accumulator.merge(period, entry.getValue(), Long::sum);
      }
    }

    return accumulator.entrySet().stream()
        .sorted(Comparator.comparing(Map.Entry::getKey))
        .map(entry -> new AnalyticsDataPoint(entry.getKey(), entry.getValue()))
        .toList();
  }

  private YearMonth toYearMonth(Instant instant) {
    if (instant == null) {
      return null;
    }
    return YearMonth.from(instant.atZone(ZoneOffset.UTC));
  }
}

