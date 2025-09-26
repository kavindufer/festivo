package com.festivo.bookings;

import java.time.OffsetDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BookingRepository extends JpaRepository<Booking, Long> {
  @Query(
      "SELECT CASE WHEN COUNT(b) > 0 THEN true ELSE false END FROM Booking b WHERE b.vendor.id = :vendorId "
          + "AND b.status <> 'CANCELLED' AND ((b.startTime < :end AND b.endTime > :start))")
  boolean existsConflictingBooking(
      @Param("vendorId") Long vendorId, @Param("start") OffsetDateTime start, @Param("end") OffsetDateTime end);

  List<Booking> findByOrganizerId(Long organizerId);

  List<Booking> findByVendorId(Long vendorId);
}
