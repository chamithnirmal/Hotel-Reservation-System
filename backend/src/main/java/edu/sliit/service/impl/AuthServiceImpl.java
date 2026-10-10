package edu.sliit.service.impl;

import edu.sliit.dto.request.LoginRequestDTO;
import edu.sliit.dto.request.RegisterRequestDTO;
import edu.sliit.dto.response.AuthResponseDTO;
import edu.sliit.dto.response.UserResponseDTO;
import edu.sliit.entity.User;
import edu.sliit.exception.InvalidRequestException;
import edu.sliit.exception.UnauthorizedAccessException;
import edu.sliit.security.JwtUtil;
import edu.sliit.security.UserPrincipal;
import edu.sliit.service.AuthService;
import edu.sliit.service.UserService;
import edu.sliit.util.ValidationUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AuthServiceImpl implements AuthService {

    private final UserService userService;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    @Override
    public AuthResponseDTO register(RegisterRequestDTO registerRequest) {
        log.info("Processing registration request for email: {}", registerRequest.getEmail());

        UserResponseDTO userResponse = userService.registerUser(registerRequest);


        User user = userService.findUserEntityById(userResponse.getId());
        UserPrincipal userPrincipal = UserPrincipal.create(user);

        // Generate JWT token with user claims
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getId());
        claims.put("role", user.getRole().name());
        claims.put("name", user.getName());

        String token = jwtUtil.generateTokenWithClaims(userPrincipal, claims);

        log.info("User registered and authenticated successfully: {}", userResponse.getEmail());

            return AuthResponseDTO.builder()
                    .token(token)
                    .type("Bearer")
                    .userId(user.getId())
                    .email(user.getEmail())
                    .name(user.getName())
                    .role(user.getRole())
                    .isActive(user.getIsActive())
                    .hotelId(user.getHotelId())
                    .message("Registration successful")
                    .build();
    }

    @Override
    public AuthResponseDTO login(LoginRequestDTO loginRequest) {
        log.info("Processing login request for email: {}", loginRequest.getEmail());

        // Validate email and password using ValidationUtil
        String emailError = ValidationUtil.getEmailValidationError(loginRequest.getEmail());
        if (emailError != null) {
            throw new InvalidRequestException(emailError);
        }

        if (!ValidationUtil.isNotEmpty(loginRequest.getPassword())) {
            throw new InvalidRequestException("Password is required");
        }

        try {
            // Authenticate user
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getEmail(),
                            loginRequest.getPassword()
                    )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);

            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            User user = userPrincipal.getUser();


            if (!user.getIsActive()) {
                throw new UnauthorizedAccessException("Account is deactivated");
            }

            // Generate JWT token with user claims
            Map<String, Object> claims = new HashMap<>();
            claims.put("userId", user.getId());
            claims.put("role", user.getRole().name());
            claims.put("name", user.getName());

            String token = jwtUtil.generateTokenWithClaims(userPrincipal, claims);

            log.info("User authenticated successfully: {}", user.getEmail());

            return AuthResponseDTO.builder()
                    .token(token)
                    .type("Bearer")
                    .userId(user.getId())
                    .email(user.getEmail())
                    .name(user.getName())
                    .role(user.getRole())
                    .isActive(user.getIsActive())
                    .hotelId(user.getHotelId())
                    .message("Login successful")
                    .build();

        } catch (BadCredentialsException e) {
            log.error("Invalid credentials for email: {}", loginRequest.getEmail());
            throw new UnauthorizedAccessException("Invalid email or password");
        }
    }

    @Override
    public void logout(String token) {

        SecurityContextHolder.clearContext();
        log.info("User logged out successfully");
    }

    @Override
    public AuthResponseDTO refreshToken(String refreshToken) {

        throw new InvalidRequestException("Refresh token functionality not implemented yet");
    }

    @Override
    public void forgotPassword(String email) {
        User user = userService.findUserEntityByEmail(email);
        

        log.info("Password reset requested for email: {}", email);
        
        throw new InvalidRequestException("Password reset functionality not implemented yet");
    }

    @Override
    public void resetPassword(String token, String newPassword) {

        throw new InvalidRequestException("Password reset functionality not implemented yet");
    }
}