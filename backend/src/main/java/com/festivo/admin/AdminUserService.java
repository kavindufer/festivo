package com.festivo.admin;

import com.festivo.admin.dto.AdminUserSummary;
import com.festivo.admin.dto.PagedResponse;
import com.festivo.admin.dto.UpdateUserRequest;
import com.festivo.common.exception.ResourceNotFoundException;
import com.festivo.users.User;
import com.festivo.users.UserRepository;
import com.festivo.users.UserRole;
import com.festivo.users.UserSpecifications;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminUserService {
  private final UserRepository userRepository;

  @Transactional(readOnly = true)
  public PagedResponse<AdminUserSummary> search(
      String search, UserRole role, Boolean active, int page, int size, String sort) {
    Pageable pageable = PageRequest.of(page, size, deriveSort(sort));
    Specification<User> spec = Specification.where(UserSpecifications.search(search));
    if (role != null) {
      spec = spec == null ? UserSpecifications.hasRole(role) : spec.and(UserSpecifications.hasRole(role));
    }
    Specification<User> activeSpec = UserSpecifications.isActive(active);
    if (activeSpec != null) {
      spec = spec == null ? activeSpec : spec.and(activeSpec);
    }

    Page<User> result = spec == null ? userRepository.findAll(pageable) : userRepository.findAll(spec, pageable);
    List<AdminUserSummary> summaries = result.stream().map(this::toSummary).toList();
    return new PagedResponse<>(summaries, result.getTotalElements(), result.getTotalPages(), page, size);
  }

  @Transactional(readOnly = true)
  public AdminUserSummary get(Long id) {
    return userRepository
        .findById(id)
        .map(this::toSummary)
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));
  }

  public AdminUserSummary update(Long id, UpdateUserRequest request) {
    User user =
        userRepository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

    Optional.ofNullable(request.displayName()).ifPresent(user::setDisplayName);
    Optional.ofNullable(request.email()).ifPresent(user::setEmail);
    Optional.ofNullable(request.role()).ifPresent(user::setRole);
    Optional.ofNullable(request.active()).ifPresent(user::setActive);
    Optional.ofNullable(request.mfaEnabled()).ifPresent(user::setMfaEnabled);

    return toSummary(userRepository.save(user));
  }

  public void delete(Long id) {
    if (!userRepository.existsById(id)) {
      throw new ResourceNotFoundException("User not found");
    }
    userRepository.deleteById(id);
  }

  private Sort deriveSort(String sort) {
    if (sort == null || sort.isBlank()) {
      return Sort.by(Sort.Direction.DESC, "createdAt");
    }

    String[] parts = sort.split(",");
    String property = parts[0];
    Sort.Direction direction = parts.length > 1 ? Sort.Direction.fromOptionalString(parts[1]).orElse(Sort.Direction.ASC) : Sort.Direction.ASC;
    return Sort.by(direction, property);
  }

  private AdminUserSummary toSummary(User user) {
    return new AdminUserSummary(
        user.getId(), user.getDisplayName(), user.getEmail(), user.getRole(), user.isActive(), user.getCreatedAt());
  }
}

