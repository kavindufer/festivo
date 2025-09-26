package com.festivo.messaging;

import com.festivo.common.security.Roles;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/chat")
public class ChatController {
  private final ChatService chatService;

  @GetMapping("/booking/{bookingId}")
  public List<Message> messages(@PathVariable Long bookingId) {
    return chatService.getMessages(bookingId);
  }

  @PostMapping("/booking/{bookingId}")
  @PreAuthorize("hasAnyAuthority('" + Roles.ORGANIZER + "','" + Roles.VENDOR + "','" + Roles.ADMIN + "')")
  public Message send(@PathVariable Long bookingId, @Valid @RequestBody MessageRequest request) {
    return chatService.sendMessage(bookingId, request.senderId(), request.content());
  }

  @PostMapping("/messages/{messageId}/read")
  public Map<String, Object> read(@PathVariable Long messageId) {
    var updated = chatService.markRead(messageId);
    return Map.of("readAt", updated.getReadAt());
  }

  public record MessageRequest(@NotNull Long senderId, @NotBlank String content) {}
}
