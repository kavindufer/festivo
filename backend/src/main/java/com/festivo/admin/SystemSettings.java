package com.festivo.admin;

import com.festivo.common.model.AuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "system_settings")
public class SystemSettings extends AuditableEntity {
  @Column(nullable = false)
  private boolean maintenanceMode = false;

  @Column(nullable = false)
  private boolean registrationsEnabled = true;

  @Column(nullable = false)
  private boolean reviewsEnabled = true;

  @Column(nullable = false)
  private boolean messagingEnabled = true;

  @Column(nullable = false)
  private boolean paymentsEnabled = true;
}

