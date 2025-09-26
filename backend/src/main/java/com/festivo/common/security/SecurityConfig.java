package com.festivo.common.security;

import java.util.Collection;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

  private static final String REALM_ACCESS = "realm_access";
  private static final String ROLES = "roles";

  @Bean
  public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http.csrf(csrf -> csrf.disable())
        .authorizeHttpRequests(
            auth ->
                auth.requestMatchers("/actuator/health", "/api/ping", "/api/payments/callback").permitAll()
                    .anyRequest()
                    .authenticated())
        .oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt -> jwt.jwtAuthenticationConverter(jwtConverter())));
    return http.build();
  }

  private JwtAuthenticationConverter jwtConverter() {
    var converter = new JwtAuthenticationConverter();
    converter.setJwtGrantedAuthoritiesConverter(this::extractAuthorities);
    return converter;
  }

  private Collection<GrantedAuthority> extractAuthorities(Jwt jwt) {
    JwtGrantedAuthoritiesConverter delegate = new JwtGrantedAuthoritiesConverter();
    var authorities = delegate.convert(jwt);
    @SuppressWarnings("unchecked")
    var realmRoles =
        Optional.ofNullable(jwt.getClaimAsMap(REALM_ACCESS))
            .map(claim -> (Collection<String>) claim.get(ROLES))
            .orElseGet(java.util.List::of);
    Set<GrantedAuthority> mappedRoles = new HashSet<>();
    realmRoles.stream()
        .map(role -> "ROLE_" + role.toUpperCase())
        .map(SimpleGrantedAuthority::new)
        .forEach(mappedRoles::add);
    if (authorities != null) {
      mappedRoles.addAll(authorities);
    }
    return mappedRoles;
  }
}
