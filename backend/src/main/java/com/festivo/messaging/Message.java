package com.festivo.messaging;

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
import java.time.Instant;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "messages")
public class Message extends AuditableEntity {
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "booking_id")
  @JsonIgnore
  private Booking booking;

  @ManyToOne(fetch = FetchType.EAGER)
  @JoinColumn(name = "sender_id")
  private User sender;

  @Column(nullable = false, length = 2000)
  private String content;

  @Column private Instant readAt;
}
