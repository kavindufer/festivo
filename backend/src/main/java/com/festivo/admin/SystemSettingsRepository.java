package com.festivo.admin;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SystemSettingsRepository extends JpaRepository<SystemSettings, Long> {
  Optional<SystemSettings> findTopByOrderByIdAsc();
}

