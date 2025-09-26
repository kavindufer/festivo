package com.festivo.users;

import com.festivo.common.model.AuditableEntity;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Table(name = "users")
public class User extends AuditableEntity {
  @Column(nullable = false, unique = true)
  private String externalId;

  @Column(nullable = false, unique = true)
  private String email;

  @Column(nullable = false)
  private String displayName;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private UserRole role;

  @Column private boolean mfaEnabled;

  @Column(nullable = false)
  private boolean active = true;
}
