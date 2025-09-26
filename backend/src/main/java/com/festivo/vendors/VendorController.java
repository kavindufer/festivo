package com.festivo.vendors;

import com.festivo.common.security.Roles;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/vendors")
public class VendorController {
  private final VendorService vendorService;

  @GetMapping
  public List<Vendor> list(
      @RequestParam(required = false) Long categoryId,
      @RequestParam(required = false) Double minRating) {
    return vendorService.search(categoryId, minRating);
  }

  @GetMapping("/{id}")
  public Vendor get(@PathVariable Long id) {
    return vendorService.getById(id);
  }

  @PostMapping
  @PreAuthorize("hasAuthority('" + Roles.VENDOR + "')")
  public Vendor create(@Valid @RequestBody VendorRequest request) {
    Vendor vendor = new Vendor();
    vendor.setName(request.name());
    vendor.setDescription(request.description());
    vendor.setLocation(request.location());
    vendor.setStartingPrice(request.startingPrice());
    return vendorService.create(vendor);
  }

  @PutMapping("/{id}")
  @PreAuthorize("hasAnyAuthority('" + Roles.VENDOR + "','" + Roles.ADMIN + "')")
  public Vendor update(@PathVariable Long id, @Valid @RequestBody VendorRequest request) {
    Vendor vendor = new Vendor();
    vendor.setName(request.name());
    vendor.setDescription(request.description());
    vendor.setLocation(request.location());
    vendor.setStartingPrice(request.startingPrice());
    return vendorService.update(id, vendor);
  }

  @DeleteMapping("/{id}")
  @PreAuthorize("hasAuthority('" + Roles.ADMIN + "')")
  public void delete(@PathVariable Long id) {
    vendorService.delete(id);
  }

  @GetMapping("/{id}/availability")
  public Map<String, Boolean> availability(
      @PathVariable Long id,
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime start,
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime end) {
    return vendorService.availability(id, start, end);
  }

  @GetMapping("/{id}/calendar")
  public Map<String, Object> calendar(
      @PathVariable Long id,
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime start,
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime end) {
    return vendorService.calendarSnapshot(id, start, end);
  }

  @GetMapping("/{id}/rating")
  public Map<String, Object> rating(@PathVariable Long id) {
    return Map.of("rating", vendorService.rating(id));
  }

  public record VendorRequest(
      @NotBlank String name,
      String description,
      String location,
      @NotNull BigDecimal startingPrice) {}
}
