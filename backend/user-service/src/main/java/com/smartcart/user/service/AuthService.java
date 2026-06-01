package com.smartcart.user.service;

import com.smartcart.user.dto.AuthDtos.*;
import com.smartcart.user.entity.User;
import com.smartcart.user.exception.ApiException;
import com.smartcart.user.repository.UserRepository;
import com.smartcart.user.security.JwtService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService implements CommandLineRunner {
    private static final Logger log = LoggerFactory.getLogger(AuthService.class);
    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final boolean seedUsers;

    public AuthService(UserRepository repository, PasswordEncoder passwordEncoder, JwtService jwtService,
                       @Value("${smartcart.seed-users:false}") boolean seedUsers) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.seedUsers = seedUsers;
    }

    public AuthResponse register(RegisterRequest request) {
        if (repository.existsByUsername(request.username())) {
            throw new ApiException(HttpStatus.CONFLICT, "Username is already registered");
        }
        User user = repository.save(new User(request.username(), passwordEncoder.encode(request.password()), "USER"));
        log.info("Registered SmartCart user {}", user.getUsername());
        return response(user);
    }

    public AuthResponse login(LoginRequest request) {
        User user = findByUsername(request.username());
        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid username or password");
        }
        log.info("Authenticated SmartCart user {}", user.getUsername());
        return response(user);
    }

    public UserResponse lookup(String username) {
        User user = findByUsername(username);
        return new UserResponse(user.getId(), user.getUsername(), user.getRole());
    }

    private User findByUsername(String username) {
        return repository.findByUsername(username)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private AuthResponse response(User user) {
        return new AuthResponse(jwtService.createToken(user), user.getId(), user.getUsername(), user.getRole());
    }

    @Override
    public void run(String... args) {
        if (seedUsers && repository.count() == 0) {
            repository.save(new User("demo", passwordEncoder.encode("demo123"), "USER"));
            repository.save(new User("admin", passwordEncoder.encode("admin123"), "ADMIN"));
            log.info("Seeded demonstration USER and ADMIN accounts");
        }
    }
}
