package com.festivo.vendors;

import com.festivo.bookings.BookingRepository;
import com.festivo.common.exception.ResourceNotFoundException;
import jakarta.transaction.Transactional;
import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Transactional
public class VendorService {
  private final VendorRepository vendorRepository;
  private final ServiceOfferingRepository offeringRepository;
  private final ServiceCategoryRepository categoryRepository;
  private final ReviewRepository reviewRepository;
  private final BookingRepository bookingRepository;

  public List<Vendor> search(Long categoryId, Double minRating) {
    return vendorRepository.search(categoryId, minRating);
  }

  public Vendor getById(Long id) {
    return vendorRepository
        .findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Vendor not found"));
  }

  public Vendor create(Vendor vendor) {
    vendor.setVerified(false);
    return vendorRepository.save(vendor);
  }

  public Vendor update(Long id, Vendor payload) {
    Vendor existing = getById(id);
    existing.setName(payload.getName());
    existing.setDescription(payload.getDescription());
    existing.setLocation(payload.getLocation());
    existing.setStartingPrice(payload.getStartingPrice());
    return existing;
  }

  public void delete(Long id) {
    vendorRepository.deleteById(id);
  }

  public List<ServiceOffering> offerings(Long vendorId) {
    return offeringRepository.findByVendorId(vendorId);
  }

  public ServiceOffering createOffering(Long vendorId, ServiceOffering offering) {
    Vendor vendor = getById(vendorId);
    if (offering.getCategory() != null && offering.getCategory().getId() != null) {
      var category =
          categoryRepository
              .findById(offering.getCategory().getId())
              .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
      offering.setCategory(category);
    }
    offering.setVendor(vendor);
    return offeringRepository.save(offering);
  }

  public Double rating(Long vendorId) {
    return reviewRepository.calculateAverageRating(vendorId);
  }

  public Map<String, Boolean> availability(Long vendorId, OffsetDateTime start, OffsetDateTime end) {
    boolean conflict = bookingRepository.existsConflictingBooking(vendorId, start, end);
    return Map.of("available", !conflict);
  }

  public Map<String, Object> calendarSnapshot(Long vendorId, OffsetDateTime start, OffsetDateTime end) {
    List<Map<String, Object>> bookings =
        bookingRepository.findByVendorId(vendorId).stream()
            .filter(b ->
                (b.getStartTime().isBefore(end) && b.getEndTime().isAfter(start)))
            .map(
                b -> {
                  Map<String, Object> event = new HashMap<>();
                  event.put("bookingId", b.getId());
                  event.put("start", b.getStartTime().toString());
                  event.put("end", b.getEndTime().toString());
                  event.put("status", b.getStatus().name());
                  return event;
                })
            .collect(Collectors.toList());
    return Map.of("events", bookings);
  }

  public Vendor verify(Long vendorId) {
    Vendor vendor = getById(vendorId);
    vendor.setVerified(true);
    return vendor;
  }
}
