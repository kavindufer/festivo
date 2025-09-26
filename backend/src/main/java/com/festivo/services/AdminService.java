package com.festivo.services;

import com.festivo.common.exception.ResourceNotFoundException;
import com.festivo.vendors.VendorService;
import jakarta.transaction.Transactional;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminService {
  private final DisputeRepository disputeRepository;
  private final VendorService vendorService;

  public List<Dispute> allDisputes() {
    return disputeRepository.findAll();
  }

  public Dispute resolve(Long disputeId, String resolutionNotes, String status) {
    Dispute dispute =
        disputeRepository
            .findById(disputeId)
            .orElseThrow(() -> new ResourceNotFoundException("Dispute not found"));
    dispute.setResolutionNotes(resolutionNotes);
    dispute.setStatus(status);
    return dispute;
  }

  public void verifyVendor(Long vendorId) {
    vendorService.verify(vendorId);
  }
}
