package com.festivo.services;

import com.festivo.common.security.Roles;
import java.util.List;
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
@RequestMapping("/api/admin")
@PreAuthorize("hasAuthority('" + Roles.ADMIN + "')")
public class AdminController {
  private final AdminService adminService;

  @GetMapping("/disputes")
  public List<Dispute> disputes() {
    return adminService.allDisputes();
  }

  @PostMapping("/disputes/{id}/resolve")
  public Dispute resolve(@PathVariable Long id, @RequestBody ResolutionRequest request) {
    return adminService.resolve(id, request.notes(), request.status());
  }

  @PostMapping("/vendors/{id}/verify")
  public Map<String, String> verify(@PathVariable Long id) {
    adminService.verifyVendor(id);
    return Map.of("status", "verified");
  }

  public record ResolutionRequest(String notes, String status) {}
}
