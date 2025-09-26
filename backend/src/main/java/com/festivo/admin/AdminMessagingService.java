package com.festivo.admin;

import com.festivo.admin.dto.ConversationSummary;
import com.festivo.messaging.Message;
import com.festivo.messaging.MessageRepository;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminMessagingService {
  private final MessageRepository messageRepository;

  public List<ConversationSummary> listConversations(String query) {
    String normalizedQuery = query != null ? query.toLowerCase(Locale.ROOT) : null;

    Map<Long, List<Message>> grouped =
        messageRepository.findAll().stream().collect(Collectors.groupingBy(message -> message.getBooking().getId()));

    return grouped.values().stream()
        .map(messages -> messages.stream().max(Comparator.comparing(Message::getCreatedAt)).orElse(null))
        .filter(latest -> latest != null)
        .filter(
            latest -> {
              if (normalizedQuery == null || normalizedQuery.isBlank()) {
                return true;
              }
              String vendorName = latest.getBooking().getVendor() != null ? latest.getBooking().getVendor().getName() : "";
              String senderName = latest.getSender() != null ? latest.getSender().getDisplayName() : "";
              String content = latest.getContent() != null ? latest.getContent() : "";
              return vendorName.toLowerCase(Locale.ROOT).contains(normalizedQuery)
                  || senderName.toLowerCase(Locale.ROOT).contains(normalizedQuery)
                  || content.toLowerCase(Locale.ROOT).contains(normalizedQuery);
            })
        .sorted(Comparator.comparing(Message::getCreatedAt).reversed())
        .map(
            latest -> {
              String content = latest.getContent() != null ? latest.getContent() : "";
              String snippet = content.length() > 120 ? content.substring(0, 117) + "..." : content;
              return new ConversationSummary(
                  latest.getBooking().getId(),
                  latest.getBooking().getVendor() != null ? latest.getBooking().getVendor().getName() : null,
                  snippet,
                  latest.getSender() != null ? latest.getSender().getDisplayName() : "Unknown",
                  latest.getCreatedAt(),
                  grouped.getOrDefault(latest.getBooking().getId(), List.of()).size());
            })
        .toList();
  }
}

