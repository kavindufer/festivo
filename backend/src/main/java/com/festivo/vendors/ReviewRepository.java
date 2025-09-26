package com.festivo.vendors;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ReviewRepository extends JpaRepository<Review, Long> {
  List<Review> findByVendorId(Long vendorId);

  @Query("SELECT AVG(r.rating) FROM Review r WHERE r.vendor.id = :vendorId")
  Double calculateAverageRating(Long vendorId);

  @Query("SELECT AVG(r.rating) FROM Review r")
  Double calculateGlobalAverageRating();
}
