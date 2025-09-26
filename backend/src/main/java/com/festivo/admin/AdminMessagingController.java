package com.festivo.admin;

import com.festivo.admin.dto.ConversationSummary;
import com.festivo.common.security.Roles;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/messages")
@PreAuthorize("hasAuthority('" + Roles.ADMIN + "')")
public class AdminMessagingController {
  private final AdminMessagingService messagingService;

  @GetMapping
  public List<ConversationSummary> conversations(@RequestParam(required = false) String q) {
    return messagingService.listConversations(q);
  }
}

