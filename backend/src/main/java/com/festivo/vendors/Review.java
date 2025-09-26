package com.festivo.vendors;

import com.festivo.bookings.Booking;
import com.festivo.common.model.AuditableEntity;
import com.festivo.users.User;
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
@Table(name = "reviews")
public class Review extends AuditableEntity {
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "booking_id")
  @JsonIgnore
  private Booking booking;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "vendor_id")
  @JsonIgnore
  private Vendor vendor;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "reviewer_id")
  @JsonIgnore
  private User reviewer;

  @Column(nullable = false)
  private int rating;

  @Column(length = 2048)
  private String comment;
}
