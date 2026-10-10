package edu.sliit.dto.response;

import edu.sliit.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponseDTO {
    
    private Long id;
    private String name;
    private String email;
    private String phoneNumber;
    private String address;
    private Role role;
    private Boolean isActive;
    private Boolean emailVerified;
    private Long hotelId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}