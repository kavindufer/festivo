package com.festivo.events;

import com.festivo.common.exception.ResourceNotFoundException;
import com.festivo.users.Customer;
import com.festivo.users.CustomerRepository;
import com.festivo.users.User;
import com.festivo.users.UserRepository;
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
  private final UserRepository userRepository;

  public Event create(String customerExternalId, String name, String description, LocalDate eventDate) {
    User user = userRepository.findByExternalId(customerExternalId).orElseThrow(() -> new ResourceNotFoundException("User not found"));
    Customer customer =
        customerRepository
            .findByUserId(user.getId())
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

  public List<Event> forCurrentUser(String customerExternalId) {
    User user = userRepository.findByExternalId(customerExternalId).orElseThrow(() -> new ResourceNotFoundException("User not found"));
    Customer customer =
        customerRepository
            .findByUserId(user.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
    return eventRepository.findByCustomerId(customer.getId());
  }

  public void delete(Long eventId) {
    Event event = get(eventId);
    eventRepository.delete(event);
  }
}
