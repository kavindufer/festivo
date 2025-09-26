package com.festivo.payments;

import com.festivo.bookings.Booking;
import com.festivo.bookings.BookingStatus;
import com.festivo.common.exception.ResourceNotFoundException;
import jakarta.transaction.Transactional;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Transactional
public class PaymentService {
  @Value("${festivo.payhere.base-url}")
  private String baseUrl;

  @Value("${festivo.payhere.merchant-id}")
  private String merchantId;

  @Value("${festivo.payhere.notify-url}")
  private String notifyUrl;

  private final PaymentRepository paymentRepository;

  public Payment ensurePaymentDraft(Booking booking) {
    return paymentRepository
        .findByProviderReference("booking-" + booking.getId())
        .orElseGet(
            () -> {
              Payment payment = new Payment();
              payment.setBooking(booking);
              payment.setProvider("PayHere");
              payment.setProviderReference("booking-" + booking.getId());
              payment.setStatus(PaymentStatus.INITIATED);
              payment.setAmount(booking.getDepositAmount() != null ? booking.getDepositAmount() : booking.getTotalAmount());
              payment.setCurrency(booking.getCurrency());
              payment.setInvoiceNumber(UUID.randomUUID().toString());
              return paymentRepository.save(payment);
            });
  }

  public Map<String, Object> createSession(Payment payment) {
    Map<String, Object> payload = new HashMap<>();
    payload.put("merchant_id", merchantId);
    payload.put("return_url", notifyUrl);
    payload.put("cancel_url", notifyUrl);
    payload.put("notify_url", notifyUrl);
    payload.put("order_id", payment.getProviderReference());
    payload.put("items", "Festivo Booking Deposit");
    payload.put("amount", payment.getAmount().toPlainString());
    payload.put("currency", payment.getCurrency());
    payload.put("hash", UUID.randomUUID().toString());
    payload.put("gateway", String.format("%s/pay/checkout", baseUrl));
    return payload;
  }

  public Payment markPaid(String providerReference, BigDecimal amount) {
    Payment payment =
        paymentRepository
            .findByProviderReference(providerReference)
            .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));
    payment.setStatus(PaymentStatus.PAID);
    payment.setPaidAt(Instant.now());
    payment.setAmount(amount);
    Booking booking = payment.getBooking();
    if (booking != null && booking.getStatus() == BookingStatus.PENDING) {
      booking.setStatus(BookingStatus.CONFIRMED);
    }
    return paymentRepository.save(payment);
  }
}
