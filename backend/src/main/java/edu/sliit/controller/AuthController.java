package edu.sliit.controller;

import edu.sliit.dto.request.LoginRequestDTO;
import edu.sliit.dto.request.RegisterRequestDTO;
import edu.sliit.dto.response.AuthResponseDTO;
import edu.sliit.service.AuthService;
import edu.sliit.util.StandardResponseDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<StandardResponseDTO> register(@RequestBody RegisterRequestDTO registerRequest) {
        log.info("Registration request received for email: {}", registerRequest.getEmail());
        
        AuthResponseDTO response = authService.register(registerRequest);
        
        return new ResponseEntity<>(
            new StandardResponseDTO(201, "User registered successfully", response),
            HttpStatus.CREATED
        );
    }

    @PostMapping("/login")
    public ResponseEntity<StandardResponseDTO> login(@RequestBody LoginRequestDTO loginRequest) {
        log.info("Login request received for email: {}", loginRequest.getEmail());
        
        AuthResponseDTO response = authService.login(loginRequest);
        
        return new ResponseEntity<>(
            new StandardResponseDTO(200, "Login successful", response),
            HttpStatus.OK
        );
    }

    @PostMapping("/logout")
    public ResponseEntity<StandardResponseDTO> logout(@RequestHeader("Authorization") String authHeader) {
        String token = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
        }
        
        authService.logout(token);
        
        return new ResponseEntity<>(
            new StandardResponseDTO(200, "Logged out successfully", null),
            HttpStatus.OK
        );
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<StandardResponseDTO> forgotPassword(@RequestParam String email) {
        log.info("Password reset request for email: {}", email);
        
        authService.forgotPassword(email);
        
        return new ResponseEntity<>(
            new StandardResponseDTO(200, "Password reset link sent to your email", null),
            HttpStatus.OK
        );
    }

    @PostMapping("/reset-password")
    public ResponseEntity<StandardResponseDTO> resetPassword(
            @RequestParam String token,
            @RequestParam String newPassword) {
        
        authService.resetPassword(token, newPassword);
        
        return new ResponseEntity<>(
            new StandardResponseDTO(200, "Password reset successfully", null),
            HttpStatus.OK
        );
    }
}