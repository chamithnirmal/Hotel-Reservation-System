package edu.sliit.service;

import edu.sliit.dto.request.RegisterRequestDTO;
import edu.sliit.dto.response.UserResponseDTO;
import edu.sliit.entity.Role;
import edu.sliit.entity.User;

import java.util.List;

public interface UserService {


    UserResponseDTO registerUser(RegisterRequestDTO registerRequest);
    
    UserResponseDTO getUserById(Long id);
    
    UserResponseDTO getUserByEmail(String email);
    
    List<UserResponseDTO> getAllUsers();
    
    List<UserResponseDTO> getUsersByRole(Role role);
    
    UserResponseDTO updateUser(Long id, UserResponseDTO userRequest);
    
    void deleteUser(Long id);
    

    boolean existsByEmail(String email);
    

    User findUserEntityByEmail(String email);
    
    User findUserEntityById(Long id);
}