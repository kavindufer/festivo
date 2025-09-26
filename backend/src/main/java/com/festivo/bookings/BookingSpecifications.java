package com.festivo.bookings;

import java.time.OffsetDateTime;
import java.util.Optional;
import org.springframework.data.jpa.domain.Specification;

public final class BookingSpecifications {
  private BookingSpecifications() {}

  public static Specification<Booking> hasStatus(BookingStatus status) {
    return Optional.ofNullable(status)
        .map(s -> (Specification<Booking>) (root, query, cb) -> cb.equal(root.get("status"), s))
        .orElse(null);
  }

  public static Specification<Booking> forVendor(Long vendorId) {
    return Optional.ofNullable(vendorId)
        .map(id -> (Specification<Booking>) (root, query, cb) -> cb.equal(root.get("vendor").get("id"), id))
        .orElse(null);
  }

  public static Specification<Booking> withinRange(OffsetDateTime start, OffsetDateTime end) {
    if (start == null && end == null) {
      return null;
    }

    return (root, query, cb) -> {
      if (start != null && end != null) {
        return cb.and(
            cb.greaterThanOrEqualTo(root.get("startTime"), start),
            cb.lessThanOrEqualTo(root.get("endTime"), end));
      }
      if (start != null) {
        return cb.greaterThanOrEqualTo(root.get("startTime"), start);
      }
      return cb.lessThanOrEqualTo(root.get("endTime"), end);
    };
  }
}

