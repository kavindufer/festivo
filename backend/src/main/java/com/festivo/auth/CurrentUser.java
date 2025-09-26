package com.festivo.auth;

import java.util.Collection;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

public final class CurrentUser {
  private CurrentUser() {}

  public static Authentication get() {
    return SecurityContextHolder.getContext().getAuthentication();
  }

  public static Collection<? extends GrantedAuthority> authorities() {
    return get().getAuthorities();
  }

  public static String subject() {
    return get().getName();
  }
}
