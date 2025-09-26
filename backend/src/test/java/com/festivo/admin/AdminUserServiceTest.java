package com.festivo.admin;

import com.festivo.admin.dto.CreateUserRequest;
import com.festivo.admin.dto.AdminUserSummary;
import com.festivo.users.User;
import com.festivo.users.UserRepository;
import com.festivo.users.UserRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AdminUserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AdminUserService adminUserService;

    private CreateUserRequest createUserRequest;
    private User user;

    @BeforeEach
    void setUp() {
        createUserRequest = new CreateUserRequest(
            "Test User",
            "test@example.com",
            "password123",
            UserRole.CUSTOMER,
            true
        );

        user = new User();
        user.setId(1L);
        user.setDisplayName("Test User");
        user.setEmail("test@example.com");
        user.setRole(UserRole.CUSTOMER);
        user.setActive(true);
        user.setExternalId("user_123456789");
    }

    @Test
    void shouldCreateUserSuccessfully() {
        // Given
        when(userRepository.existsByEmail("test@example.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenReturn(user);

        // When
        AdminUserSummary result = adminUserService.create(createUserRequest);

        // Then
        assertNotNull(result);
        assertEquals("Test User", result.displayName());
        assertEquals("test@example.com", result.email());
        assertEquals(UserRole.CUSTOMER, result.role());
        assertTrue(result.active());

        verify(userRepository).existsByEmail("test@example.com");
        verify(userRepository).save(any(User.class));
    }

    @Test
    void shouldThrowExceptionWhenEmailAlreadyExists() {
        // Given
        when(userRepository.existsByEmail("test@example.com")).thenReturn(true);

        // When & Then
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> adminUserService.create(createUserRequest)
        );

        assertEquals("User with this email already exists", exception.getMessage());
        verify(userRepository).existsByEmail("test@example.com");
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void shouldCreateUserWithDefaultActiveStatus() {
        // Given
        CreateUserRequest requestWithoutActive = new CreateUserRequest(
            "Test User",
            "test@example.com",
            "password123",
            UserRole.CUSTOMER,
            null // active is null
        );

        when(userRepository.existsByEmail("test@example.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenReturn(user);

        // When
        AdminUserSummary result = adminUserService.create(requestWithoutActive);

        // Then
        assertNotNull(result);
        assertTrue(result.active()); // Should default to true

        verify(userRepository).save(argThat(savedUser -> savedUser.isActive()));
    }
}