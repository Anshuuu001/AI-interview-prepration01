package com.elevateai.backend.controller;

import com.elevateai.backend.dto.AuthResponse;
import com.elevateai.backend.dto.LoginRequest;
import com.elevateai.backend.dto.RegisterRequest;
import com.elevateai.backend.entity.Role;
import com.elevateai.backend.entity.User;
import com.elevateai.backend.repository.UserRepository;
import com.elevateai.backend.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        Optional<User> userOptional = userRepository.findByEmail(loginRequest.getEmail());
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            return ResponseEntity.ok(new AuthResponse(jwt, user.getId(), user.getName(), user.getEmail(), user.getRole().name()));
        }

        return ResponseEntity.badRequest().body("Error: Unable to retrieve user info.");
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest registerRequest) {
        if (userRepository.findByEmail(registerRequest.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Error: Email Address already in use!");
        }

        User user = new User();
        user.setId("usr_" + UUID.randomUUID().toString().substring(0, 8));
        user.setName(registerRequest.getName());
        user.setEmail(registerRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setRole(Role.student);

        userRepository.save(user);

        return ResponseEntity.ok("User registered successfully");
    }

    @PostMapping("/google")
    public ResponseEntity<?> authenticateUserGoogle(@RequestBody java.util.Map<String, Object> requestBody) {
        java.util.Map<String, Object> credential = (java.util.Map<String, Object>) requestBody.get("credential");
        if (credential == null) {
            return ResponseEntity.badRequest().body("Error: Missing credentials payload.");
        }

        String email = (String) credential.get("email");
        String name = (String) credential.get("name");

        if (email == null) {
            return ResponseEntity.badRequest().body("Error: Email is required.");
        }

        Optional<User> userOptional = userRepository.findByEmail(email);
        User user;
        if (userOptional.isPresent()) {
            user = userOptional.get();
        } else {
            user = new User();
            user.setId("usr_" + UUID.randomUUID().toString().substring(0, 8));
            user.setName(name != null ? name : "Google User");
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode("google-" + UUID.randomUUID().toString()));
            user.setRole(Role.student);
            userRepository.save(user);
        }

        if (Boolean.TRUE.equals(user.getIsBanned())) {
            return ResponseEntity.status(403).body("Error: This account has been permanently banned.");
        }

        org.springframework.security.core.userdetails.UserDetails userDetails = 
            new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                java.util.Collections.singletonList(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
            );

        Authentication authentication = new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities()
        );
        
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        return ResponseEntity.ok(new AuthResponse(jwt, user.getId(), user.getName(), user.getEmail(), user.getRole().name()));
    }
}
