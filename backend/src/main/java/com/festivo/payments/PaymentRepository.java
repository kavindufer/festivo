package com.festivo.payments;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
  Optional<Payment> findByProviderReference(String providerReference);

  List<Payment> findByBookingIdIn(Collection<Long> bookingIds);
}
