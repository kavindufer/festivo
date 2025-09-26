package com.festivo.events;

import com.festivo.auth.CurrentUser;
import com.festivo.common.security.Roles;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/events")
@PreAuthorize("hasAnyAuthority('" + Roles.CUSTOMER + "','" + Roles.ADMIN + "')")
public class EventController {
  private final EventService eventService;

  @PostMapping
  public Event create(@Valid @RequestBody EventRequest request) {
    return eventService.create(
        CurrentUser.subject(), request.name(), request.description(), request.eventDate());
  }

  @GetMapping("/{eventId}")
  public Event get(@PathVariable Long eventId) {
    return eventService.get(eventId);
  }

  @GetMapping
  public List<Event> forCustomer(@RequestParam Long customerId) {
    return eventService.forCustomer(customerId);
  }

  @PutMapping("/{eventId}")
  public Event update(@PathVariable Long eventId, @Valid @RequestBody EventRequest request) {
    return eventService.update(eventId, request.name(), request.description(), request.eventDate());
  }

  @DeleteMapping("/{eventId}")
  public void delete(@PathVariable Long eventId) {
    eventService.delete(eventId);
  }

  public record EventRequest(
      @NotBlank String name,
      String description,
      @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate eventDate) {}
}
