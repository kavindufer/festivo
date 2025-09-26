package com.festivo.admin;

import com.festivo.admin.dto.SystemSettingsDto;
import com.festivo.common.security.Roles;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/settings")
@PreAuthorize("hasAuthority('" + Roles.ADMIN + "')")
public class AdminSettingsController {
  private final AdminSettingsService settingsService;

  @GetMapping
  public SystemSettingsDto get() {
    return settingsService.getSettings();
  }

  @PutMapping
  public SystemSettingsDto update(@RequestBody SystemSettingsDto request) {
    return settingsService.update(request);
  }
}

