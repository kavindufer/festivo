package com.festivo.services;

import com.festivo.bookings.Booking;
import com.festivo.common.model.AuditableEntity;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "disputes")
public class Dispute extends AuditableEntity {
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "booking_id")
  @JsonIgnore
  private Booking booking;

  @Column(nullable = false)
  private String reason;

  @Column(length = 2048)
  private String resolutionNotes;

  @Column(nullable = false)
  private String status;
}
