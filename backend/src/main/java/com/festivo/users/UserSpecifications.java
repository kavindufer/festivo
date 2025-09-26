package com.festivo.users;

import java.util.Optional;
import org.springframework.data.jpa.domain.Specification;

public final class UserSpecifications {
  private UserSpecifications() {}

  public static Specification<User> hasRole(UserRole role) {
    return (root, query, cb) -> cb.equal(root.get("role"), role);
  }

  public static Specification<User> isActive(Boolean active) {
    return Optional.ofNullable(active)
        .map(flag -> (Specification<User>) (root, query, cb) -> cb.equal(root.get("active"), flag))
        .orElse(null);
  }

  public static Specification<User> search(String term) {
    if (term == null || term.isBlank()) {
      return null;
    }

    String likeTerm = "%" + term.trim().toLowerCase() + "%";
    return (root, query, cb) ->
        cb.or(
            cb.like(cb.lower(root.get("email")), likeTerm),
            cb.like(cb.lower(root.get("displayName")), likeTerm));
  }
}

