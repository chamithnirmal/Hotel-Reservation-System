package edu.sliit.dto.response;

import edu.sliit.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponseDTO {
    
    private String token;
    private String type = "Bearer";
    private Long userId;
    private String email;
    private String name;
    private Role role;
    private Boolean isActive;
    private Long hotelId;  // For HOTEL_MANAGER role
    private String message;
}