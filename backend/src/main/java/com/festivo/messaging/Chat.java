package com.festivo.messaging;

import com.festivo.bookings.Booking;
import com.festivo.common.model.AuditableEntity;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "chats")
public class Chat extends AuditableEntity {
  @OneToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "booking_id")
  @JsonIgnore
  private Booking booking;

  @OneToMany(mappedBy = "chat", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<Message> messages;
}
