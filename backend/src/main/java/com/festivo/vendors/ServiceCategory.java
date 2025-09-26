package com.festivo.vendors;

import com.festivo.common.model.AuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "service_categories")
public class ServiceCategory extends AuditableEntity {
  @Column(nullable = false, unique = true)
  private String name;

  @Column(length = 1024)
  private String description;
}
