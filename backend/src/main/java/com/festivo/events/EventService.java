package com.festivo.events;

import com.festivo.common.exception.ResourceNotFoundException;
import com.festivo.users.Customer;
import com.festivo.users.CustomerRepository;
import jakarta.transaction.Transactional;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Transactional
public class EventService {
  private final EventRepository eventRepository;
  private final CustomerRepository customerRepository;

  public Event create(Long customerId, String name, String description, LocalDate eventDate) {
    Customer customer =
        customerRepository
            .findById(customerId)
            .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

    Event event = new Event();
    event.setCustomer(customer);
    event.setName(name);
    event.setDescription(description);
    event.setEventDate(eventDate);
    return eventRepository.save(event);
  }

  public Event update(Long eventId, String name, String description, LocalDate eventDate) {
    Event event = get(eventId);
    event.setName(name);
    event.setDescription(description);
    event.setEventDate(eventDate);
    return eventRepository.save(event);
  }

  public Event get(Long eventId) {
    return eventRepository
        .findById(eventId)
        .orElseThrow(() -> new ResourceNotFoundException("Event not found"));
  }

  public List<Event> forCustomer(Long customerId) {
    return eventRepository.findByCustomerId(customerId);
  }

  public void delete(Long eventId) {
    Event event = get(eventId);
    eventRepository.delete(event);
  }
}
