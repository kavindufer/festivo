package com.festivo.bookings;

import com.festivo.common.exception.ConflictException;
import com.festivo.common.exception.ResourceNotFoundException;
import com.festivo.payments.PaymentService;
import com.festivo.users.User;
import com.festivo.users.UserRepository;
import com.festivo.vendors.ServiceOffering;
import com.festivo.vendors.ServiceOfferingRepository;
import com.festivo.vendors.Vendor;
import com.festivo.vendors.VendorRepository;
import jakarta.transaction.Transactional;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Transactional
public class BookingService {
  private final BookingRepository bookingRepository;
  private final VendorRepository vendorRepository;
  private final ServiceOfferingRepository serviceOfferingRepository;
  private final UserRepository userRepository;
  private final PaymentService paymentService;

  public Booking create(
      Long vendorId,
      Long serviceId,
      Long organizerId,
      OffsetDateTime start,
      OffsetDateTime end,
      BigDecimal total,
      BigDecimal deposit,
      String currency,
      String notes,
      String timezone) {
    if (bookingRepository.existsConflictingBooking(vendorId, start, end)) {
      throw new ConflictException("Vendor is not available for the selected slot");
    }
    if (deposit != null && deposit.compareTo(total) > 0) {
      throw new ConflictException("Deposit cannot exceed total amount");
    }
    Vendor vendor =
        vendorRepository
            .findById(vendorId)
            .orElseThrow(() -> new ResourceNotFoundException("Vendor not found"));
    ServiceOffering offering =
        serviceOfferingRepository
            .findById(serviceId)
            .orElseThrow(() -> new ResourceNotFoundException("Service not found"));
    User organizer =
        userRepository
            .findById(organizerId)
            .orElseThrow(() -> new ResourceNotFoundException("Organizer not found"));

    Booking booking = new Booking();
    booking.setVendor(vendor);
    booking.setService(offering);
    booking.setOrganizer(organizer);
    booking.setStartTime(start);
    booking.setEndTime(end);
    booking.setStatus(BookingStatus.PENDING);
    booking.setTotalAmount(total);
    booking.setDepositAmount(deposit);
    booking.setCurrency(currency);
    booking.setNotes(notes);
    booking.setTimezone(timezone);
    Booking saved = bookingRepository.save(booking);
    paymentService.ensurePaymentDraft(saved);
    return saved;
  }

  public Booking confirm(Long bookingId) {
    Booking booking = get(bookingId);
    booking.setStatus(BookingStatus.CONFIRMED);
    return booking;
  }

  public Booking cancel(Long bookingId) {
    Booking booking = get(bookingId);
    booking.setStatus(BookingStatus.CANCELLED);
    return booking;
  }

  public Booking get(Long bookingId) {
    return bookingRepository
        .findById(bookingId)
        .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
  }

  public List<Booking> forOrganizer(Long organizerId) {
    return bookingRepository.findByOrganizerId(organizerId);
  }

  public List<Booking> forVendor(Long vendorId) {
    return bookingRepository.findByVendorId(vendorId);
  }

  public boolean hasConflictingBooking(Long vendorId, OffsetDateTime start, OffsetDateTime end) {
    return bookingRepository.existsConflictingBooking(vendorId, start, end);
  }
}
