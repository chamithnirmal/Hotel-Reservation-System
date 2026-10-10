package edu.sliit.controller;

import edu.sliit.dto.response.UserResponseDTO;
import edu.sliit.entity.Role;
import edu.sliit.security.UserPrincipal;
import edu.sliit.service.UserService;
import edu.sliit.util.StandardResponseDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Slf4j
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'HOTEL_MANAGER', 'ADMIN')")
    public ResponseEntity<StandardResponseDTO> getCurrentUserProfile(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        Long userId = userPrincipal.getUser().getId();
        UserResponseDTO user = userService.getUserById(userId);
        
        return new ResponseEntity<>(
            new StandardResponseDTO(200, "Profile retrieved successfully", user),
            HttpStatus.OK
        );
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.principal.user.id")
    public ResponseEntity<StandardResponseDTO> getUserById(@PathVariable Long id) {
        UserResponseDTO user = userService.getUserById(id);
        
        return new ResponseEntity<>(
            new StandardResponseDTO(200, "User retrieved successfully", user),
            HttpStatus.OK
        );
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StandardResponseDTO> getAllUsers() {
        List<UserResponseDTO> users = userService.getAllUsers();
        
        return new ResponseEntity<>(
            new StandardResponseDTO(200, "All users retrieved successfully", users),
            HttpStatus.OK
        );
    }

    @GetMapping("/role/{role}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StandardResponseDTO> getUsersByRole(@PathVariable Role role) {
        List<UserResponseDTO> users = userService.getUsersByRole(role);
        
        return new ResponseEntity<>(
            new StandardResponseDTO(200, "Users by role retrieved successfully", users),
            HttpStatus.OK
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.principal.user.id")
    public ResponseEntity<StandardResponseDTO> updateUser(
            @PathVariable Long id,
            @RequestBody UserResponseDTO userRequest) {
        
        UserResponseDTO updatedUser = userService.updateUser(id, userRequest);
        
        return new ResponseEntity<>(
            new StandardResponseDTO(200, "User updated successfully", updatedUser),
            HttpStatus.OK
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StandardResponseDTO> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        
        return new ResponseEntity<>(
            new StandardResponseDTO(204, "User deleted successfully", null),
            HttpStatus.NO_CONTENT
        );
    }
}