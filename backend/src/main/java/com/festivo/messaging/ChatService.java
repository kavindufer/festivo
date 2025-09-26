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
  private final ChatRepository chatRepository;
  private final MessageRepository messageRepository;
  private final BookingService bookingService;
  private final UserRepository userRepository;

  public Chat ensureChat(Long bookingId) {
    return chatRepository
        .findByBookingId(bookingId)
        .orElseGet(
            () -> {
              Booking booking = bookingService.get(bookingId);
              Chat chat = new Chat();
              chat.setBooking(booking);
              return chatRepository.save(chat);
            });
  }

  public List<Message> getMessages(Long bookingId) {
    Chat chat = ensureChat(bookingId);
    return messageRepository.findByChatIdOrderByCreatedAtAsc(chat.getId());
  }

  public Message sendMessage(Long bookingId, Long senderId, String content) {
    Chat chat = ensureChat(bookingId);
    User sender =
        userRepository
            .findById(senderId)
            .orElseThrow(() -> new ResourceNotFoundException("Sender not found"));
    Message message = new Message();
    message.setChat(chat);
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
