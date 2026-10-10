package edu.sliit.dto.request;

import edu.sliit.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequestDTO {

    private String name;
    private String email;
    private String password;
    private String confirmPassword;
    private String phoneNumber;
    private String address;
    private Role role;
}