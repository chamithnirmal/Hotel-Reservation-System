package edu.sliit.service;

import edu.sliit.dto.request.LoginRequestDTO;
import edu.sliit.dto.request.RegisterRequestDTO;
import edu.sliit.dto.response.AuthResponseDTO;

public interface AuthService {

    AuthResponseDTO register(RegisterRequestDTO registerRequest);
    
    AuthResponseDTO login(LoginRequestDTO loginRequest);
    
    void logout(String token);
    
    AuthResponseDTO refreshToken(String refreshToken);
    
    void forgotPassword(String email);
    
    void resetPassword(String token, String newPassword);
}