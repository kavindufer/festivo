package com.festivo.messaging;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MessageRepository extends JpaRepository<Message, Long> {
  List<Message> findByBookingIdOrderByCreatedAtAsc(Long bookingId);
}
