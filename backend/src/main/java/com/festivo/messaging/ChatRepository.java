package com.festivo.messaging;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChatRepository extends JpaRepository<Chat, Long> {
  Optional<Chat> findByBookingId(Long bookingId);
}
