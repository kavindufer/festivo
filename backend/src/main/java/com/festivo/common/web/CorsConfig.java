package com.festivo.common.web;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {

  private static final String DEFAULT_ALLOWED_ORIGIN = "http://localhost";

  @Value("${app.cors.allowed-origins:http://localhost,http://localhost:*}")
  private String[] allowedOrigins;

  @Bean
  public WebMvcConfigurer corsConfigurer() {
    return new WebMvcConfigurer() {
      @Override
      public void addCorsMappings(CorsRegistry registry) {
        registry
            .addMapping("/**")
            .allowedOriginPatterns(getAllowedOrigins())
            .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
            .allowedHeaders("*")
            .exposedHeaders("Location")
            .allowCredentials(true);
      }
    };
  }

  private String[] getAllowedOrigins() {
    if (allowedOrigins == null || allowedOrigins.length == 0) {
      return new String[] {DEFAULT_ALLOWED_ORIGIN};
    }
    var sanitized = java.util.Arrays.stream(allowedOrigins)
        .filter(origin -> origin != null && !origin.isBlank())
        .map(String::trim)
        .toArray(String[]::new);
    if (sanitized.length == 0) {
      return new String[] {DEFAULT_ALLOWED_ORIGIN};
    }
    return sanitized;
  }
}

