package com.festivo.payments;

import com.festivo.bookings.BookingService;
import com.festivo.common.security.Roles;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
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
@RequestMapping("/api/payments")
public class PaymentController {
  private final PaymentService paymentService;
  private final PaymentRepository paymentRepository;
  private final BookingService bookingService;

  @GetMapping("/booking/{bookingId}")
  @PreAuthorize("hasAnyAuthority('" + Roles.ORGANIZER + "','" + Roles.ADMIN + "')")
  public Map<String, Object> session(@PathVariable Long bookingId) {
    var booking = bookingService.get(bookingId);
    var payment = paymentService.ensurePaymentDraft(booking);
    return paymentService.createSession(payment);
  }

  @PostMapping("/callback")
  public Map<String, Object> callback(@Valid @RequestBody PaymentCallback payload) {
    var payment = paymentService.markPaid(payload.orderId(), payload.amount());
    return Map.of("status", payment.getStatus(), "invoice", payment.getInvoiceNumber());
  }

  @PostMapping("/{paymentId}/refund")
  @PreAuthorize("hasAuthority('" + Roles.ADMIN + "')")
  public Payment refund(@PathVariable Long paymentId) {
    var payment =
        paymentRepository
            .findById(paymentId)
            .orElseThrow(() -> new IllegalArgumentException("Payment not found"));
    payment.setStatus(PaymentStatus.REFUNDED);
    return paymentRepository.save(payment);
  }

  public record PaymentCallback(@NotBlank String orderId, @NotNull BigDecimal amount) {}
}
