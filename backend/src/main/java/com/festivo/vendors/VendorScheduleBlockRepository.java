package com.festivo.vendors;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VendorScheduleBlockRepository extends JpaRepository<VendorScheduleBlock, Long> {
  List<VendorScheduleBlock> findByVendorIdOrderByStartDateAsc(Long vendorId);

  void deleteByVendorId(Long vendorId);
}

