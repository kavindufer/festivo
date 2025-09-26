package com.festivo.admin;

import com.festivo.admin.dto.SystemSettingsDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminSettingsService {
  private final SystemSettingsRepository settingsRepository;

  @Transactional(readOnly = true)
  public SystemSettingsDto getSettings() {
    SystemSettings settings =
        settingsRepository.findTopByOrderByIdAsc().orElseGet(() -> settingsRepository.save(new SystemSettings()));
    return toDto(settings);
  }

  public SystemSettingsDto update(SystemSettingsDto payload) {
    SystemSettings settings =
        settingsRepository.findTopByOrderByIdAsc().orElseGet(() -> settingsRepository.save(new SystemSettings()));
    settings.setMaintenanceMode(payload.maintenanceMode());
    settings.setRegistrationsEnabled(payload.registrationsEnabled());
    settings.setReviewsEnabled(payload.reviewsEnabled());
    settings.setMessagingEnabled(payload.messagingEnabled());
    settings.setPaymentsEnabled(payload.paymentsEnabled());
    settingsRepository.save(settings);
    return toDto(settings);
  }

  private SystemSettingsDto toDto(SystemSettings settings) {
    return new SystemSettingsDto(
        settings.isMaintenanceMode(),
        settings.isRegistrationsEnabled(),
        settings.isReviewsEnabled(),
        settings.isMessagingEnabled(),
        settings.isPaymentsEnabled());
  }
}

