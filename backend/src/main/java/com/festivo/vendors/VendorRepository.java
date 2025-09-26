package com.festivo.vendors;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface VendorRepository extends JpaRepository<Vendor, Long> {
  @Query(
      "SELECT v FROM Vendor v WHERE (:categoryId IS NULL OR EXISTS (SELECT 1 FROM ServiceOffering s WHERE s.vendor = v AND s.category.id = :categoryId)) "
          + "AND (:minRating IS NULL OR v.rating >= :minRating)" )
  List<Vendor> search(@Param("categoryId") Long categoryId, @Param("minRating") Double minRating);
}
