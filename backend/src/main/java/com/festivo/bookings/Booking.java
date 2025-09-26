package com.festivo.bookings;

import com.festivo.common.model.AuditableEntity;
import com.festivo.events.Event;
import com.festivo.vendors.ServiceOffering;
import com.festivo.vendors.Vendor;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(
    name = "bookings",
    uniqueConstraints =
        @UniqueConstraint(
            name = "uk_booking_vendor_slot",
            columnNames = {"vendor_id", "start_time", "end_time"}))
public class Booking extends AuditableEntity {
  @ManyToOne(fetch = FetchType.EAGER)
  @JoinColumn(name = "vendor_id")
  private Vendor vendor;

  @ManyToOne(fetch = FetchType.EAGER)
  @JoinColumn(name = "service_id")
  private ServiceOffering service;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "event_id")
  private Event event;

  @Column(nullable = false)
  private OffsetDateTime startTime;

  @Column(nullable = false)
  private OffsetDateTime endTime;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private BookingStatus status = BookingStatus.PENDING;

  @Column(precision = 10, scale = 2, nullable = false)
  private BigDecimal totalAmount;

  @Column(precision = 10, scale = 2)
  private BigDecimal depositAmount;

  @Column(nullable = false)
  private String currency;

  @Column(length = 1024)
  private String notes;

  @Column(nullable = false)
  private String timezone;
}
