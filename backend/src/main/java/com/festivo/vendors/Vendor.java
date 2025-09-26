package com.festivo.vendors;

import com.festivo.common.model.AuditableEntity;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.festivo.users.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@JsonIgnoreProperties({"owner", "services"})
@Table(name = "vendors")
public class Vendor extends AuditableEntity {
  @Column(nullable = false)
  private String name;

  @Column(length = 2048)
  private String description;

  @Column private String location;

  @Column private boolean verified;

  @Column(precision = 10, scale = 2)
  private BigDecimal startingPrice;

  @Column private Double rating;

  @OneToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id")
  private User owner;

  @OneToMany(mappedBy = "vendor", fetch = FetchType.LAZY)
  private List<ServiceOffering> services;
}
