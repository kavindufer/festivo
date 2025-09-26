package com.festivo.messaging;

import com.festivo.bookings.Booking;
import com.festivo.bookings.BookingService;
import com.festivo.common.exception.ResourceNotFoundException;
import com.festivo.users.User;
import com.festivo.users.UserRepository;
import jakarta.transaction.Transactional;
import java.time.Instant;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Transactional
public class ChatService {
  private final MessageRepository messageRepository;
  private final BookingService bookingService;
  private final UserRepository userRepository;

  public List<Message> getMessages(Long bookingId) {
    bookingService.get(bookingId);
    return messageRepository.findByBookingIdOrderByCreatedAtAsc(bookingId);
  }

  public Message sendMessage(Long bookingId, String senderExternalId, String content) {
    Booking booking = bookingService.get(bookingId);
    User sender =
        userRepository
            .findByExternalId(senderExternalId)
            .orElseThrow(() -> new ResourceNotFoundException("Sender not found"));
    Message message = new Message();
    message.setBooking(booking);
    message.setSender(sender);
    message.setContent(content);
    return messageRepository.save(message);
  }

  public Message markRead(Long messageId) {
    Message message =
        messageRepository
            .findById(messageId)
            .orElseThrow(() -> new ResourceNotFoundException("Message not found"));
    message.setReadAt(Instant.now());
    return message;
  }
}
