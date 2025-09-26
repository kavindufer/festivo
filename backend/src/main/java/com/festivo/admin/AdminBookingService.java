package com.festivo.admin;

import com.festivo.admin.dto.AdminBookingSummary;
import com.festivo.admin.dto.PagedResponse;
import com.festivo.bookings.Booking;
import com.festivo.bookings.BookingRepository;
import com.festivo.bookings.BookingSpecifications;
import com.festivo.bookings.BookingStatus;
import com.festivo.common.exception.ResourceNotFoundException;
import java.time.OffsetDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminBookingService {
  private final BookingRepository bookingRepository;

  @Transactional(readOnly = true)
  public PagedResponse<AdminBookingSummary> search(
      BookingStatus status,
      Long vendorId,
      OffsetDateTime start,
      OffsetDateTime end,
      int page,
      int size,
      String sort) {
    Specification<Booking> spec = Specification.where(BookingSpecifications.hasStatus(status));
    Specification<Booking> vendorSpec = BookingSpecifications.forVendor(vendorId);
    if (vendorSpec != null) {
      spec = spec == null ? vendorSpec : spec.and(vendorSpec);
    }
    Specification<Booking> rangeSpec = BookingSpecifications.withinRange(start, end);
    if (rangeSpec != null) {
      spec = spec == null ? rangeSpec : spec.and(rangeSpec);
    }

    Pageable pageable = PageRequest.of(page, size, deriveSort(sort));
    Page<Booking> result = spec == null ? bookingRepository.findAll(pageable) : bookingRepository.findAll(spec, pageable);
    List<AdminBookingSummary> content = result.stream().map(this::toSummary).toList();
    return new PagedResponse<>(content, result.getTotalElements(), result.getTotalPages(), page, size);
  }

  public AdminBookingSummary cancel(Long bookingId) {
    Booking booking =
        bookingRepository
            .findById(bookingId)
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
    booking.setStatus(BookingStatus.CANCELLED);
    return toSummary(booking);
  }

  @Transactional(readOnly = true)
  public AdminBookingSummary get(Long id) {
    return bookingRepository
        .findById(id)
        .map(this::toSummary)
        .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
  }

  private Sort deriveSort(String sort) {
    if (sort == null || sort.isBlank()) {
      return Sort.by(Sort.Direction.DESC, "startTime");
    }
    String[] parts = sort.split(",");
    String property = parts[0];
    Sort.Direction direction = parts.length > 1 ? Sort.Direction.fromOptionalString(parts[1]).orElse(Sort.Direction.ASC) : Sort.Direction.ASC;
    return Sort.by(direction, property);
  }

  private AdminBookingSummary toSummary(Booking booking) {
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

