package com.festivo.vendors;

import com.festivo.common.model.AuditableEntity;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "services")
public class ServiceOffering extends AuditableEntity {
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "vendor_id")
  @JsonIgnore
  private Vendor vendor;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "category_id")
  @JsonIgnore
  private ServiceCategory category;

  @Column(nullable = false)
  private String title;

  @Column(length = 2048)
  private String description;

  @Column(precision = 10, scale = 2, nullable = false)
  private BigDecimal price;

  @Column(nullable = false)
  private String currency;
}
