package com.festivo.payments;

import com.festivo.bookings.Booking;
import com.festivo.common.model.AuditableEntity;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "payments")
public class Payment extends AuditableEntity {
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "booking_id")
  @JsonIgnore
  private Booking booking;

  @Column(nullable = false)
  private String provider;

  @Column(nullable = false)
  private String providerReference;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private PaymentStatus status;

  @Column(precision = 10, scale = 2, nullable = false)
  private BigDecimal amount;

  @Column(nullable = false)
  private String currency;

  @Column
  private Instant paidAt;

  @Column
  private String invoiceNumber;
}
