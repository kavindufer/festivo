package com.festivo.admin;

import com.festivo.admin.dto.AdminUserSummary;
import com.festivo.admin.dto.PagedResponse;
import com.festivo.admin.dto.UpdateUserRequest;
import com.festivo.common.security.Roles;
import com.festivo.users.UserRole;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/users")
@PreAuthorize("hasAuthority('" + Roles.ADMIN + "')")
public class AdminUserController {
  private final AdminUserService userService;

  @GetMapping
  public PagedResponse<AdminUserSummary> list(
      @RequestParam(required = false) String search,
      @RequestParam(required = false) UserRole role,
      @RequestParam(required = false) Boolean active,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size,
      @RequestParam(required = false) String sort) {
    return userService.search(search, role, active, Math.max(page, 0), Math.max(1, Math.min(size, 100)), sort);
  }

  @GetMapping("/{id}")
  public AdminUserSummary get(@PathVariable Long id) {
    return userService.get(id);
  }

  @PutMapping("/{id}")
  public AdminUserSummary update(@PathVariable Long id, @RequestBody UpdateUserRequest request) {
    return userService.update(id, request);
  }

  @DeleteMapping("/{id}")
  public void delete(@PathVariable Long id) {
    userService.delete(id);
  }
}

