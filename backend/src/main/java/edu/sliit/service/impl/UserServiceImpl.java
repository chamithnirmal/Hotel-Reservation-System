package edu.sliit.service.impl;

import edu.sliit.dto.request.RegisterRequestDTO;
import edu.sliit.dto.response.UserResponseDTO;
import edu.sliit.entity.Role;
import edu.sliit.entity.User;
import edu.sliit.exception.ResourceNotFoundException;
import edu.sliit.exception.InvalidRequestException;
import edu.sliit.repository.UserRepository;
import edu.sliit.service.UserService;
import edu.sliit.util.ValidationUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final ModelMapper modelMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserResponseDTO registerUser(RegisterRequestDTO registerRequest) {
        log.info("Registering new user with email: {}", registerRequest.getEmail());

        // Validate name
        String nameError = ValidationUtil.getNameValidationError(registerRequest.getName());
        if (nameError != null) {
            throw new InvalidRequestException(nameError);
        }

        // Validate email
        String emailError = ValidationUtil.getEmailValidationError(registerRequest.getEmail());
        if (emailError != null) {
            throw new InvalidRequestException(emailError);
        }

        // Validate password
        String passwordError = ValidationUtil.getPasswordValidationError(registerRequest.getPassword());
        if (passwordError != null) {
            throw new InvalidRequestException(passwordError);
        }

        // Check if passwords match
        String confirmPasswordError = ValidationUtil.getConfirmPasswordValidationError(
                registerRequest.getPassword(),
                registerRequest.getConfirmPassword()
        );
        if (confirmPasswordError != null) {
            throw new InvalidRequestException(confirmPasswordError);
        }

        // Check if email already exists
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new InvalidRequestException("Email already exists: " + registerRequest.getEmail());
        }

        // Validate phone number if provided
        if (registerRequest.getPhoneNumber() != null && !registerRequest.getPhoneNumber().isEmpty()) {
            String phoneError = ValidationUtil.getPhoneValidationError(registerRequest.getPhoneNumber());
            if (phoneError != null) {
                throw new InvalidRequestException(phoneError);
            }
        }

        // Create new user
        User user = User.builder()
                .name(registerRequest.getName())
                .email(registerRequest.getEmail())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .phoneNumber(registerRequest.getPhoneNumber())
                .address(registerRequest.getAddress())
                .role(registerRequest.getRole())
                .isActive(true)
                .emailVerified(false)
                .build();

        User savedUser = userRepository.save(user);
        log.info("User registered successfully with ID: {}", savedUser.getId());

        return modelMapper.map(savedUser, UserResponseDTO.class);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponseDTO getUserById(Long id) {
        User user = findUserEntityById(id);
        return modelMapper.map(user, UserResponseDTO.class);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponseDTO getUserByEmail(String email) {
        User user = findUserEntityByEmail(email);
        return modelMapper.map(user, UserResponseDTO.class);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponseDTO> getAllUsers() {
        List<User> users = userRepository.findByIsActive(true);
        return users.stream()
                .map(user -> modelMapper.map(user, UserResponseDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponseDTO> getUsersByRole(Role role) {
        List<User> users = userRepository.findByRoleAndIsActive(role, true);
        return users.stream()
                .map(user -> modelMapper.map(user, UserResponseDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public UserResponseDTO updateUser(Long id, UserResponseDTO userRequest) {
        User existingUser = findUserEntityById(id);


        if (userRequest.getName() != null) {
            String nameError = ValidationUtil.getNameValidationError(userRequest.getName());
            if (nameError != null) {
                throw new InvalidRequestException(nameError);
            }
            existingUser.setName(userRequest.getName());
        }


        if (userRequest.getPhoneNumber() != null && !userRequest.getPhoneNumber().isEmpty()) {
            String phoneError = ValidationUtil.getPhoneValidationError(userRequest.getPhoneNumber());
            if (phoneError != null) {
                throw new InvalidRequestException(phoneError);
            }
            existingUser.setPhoneNumber(userRequest.getPhoneNumber());
        }

        existingUser.setAddress(userRequest.getAddress());

        // Check if email is being changed and doesn't already exist
        if (!existingUser.getEmail().equals(userRequest.getEmail())) {
            String emailError = ValidationUtil.getEmailValidationError(userRequest.getEmail());
            if (emailError != null) {
                throw new InvalidRequestException(emailError);
            }
            if (userRepository.existsByEmail(userRequest.getEmail())) {
                throw new InvalidRequestException("Email already exists: " + userRequest.getEmail());
            }
            existingUser.setEmail(userRequest.getEmail());
        }

        User updatedUser = userRepository.save(existingUser);
        log.info("User updated successfully with ID: {}", updatedUser.getId());

        return modelMapper.map(updatedUser, UserResponseDTO.class);
    }

    @Override
    public void deleteUser(Long id) {
        User user = findUserEntityById(id);
        user.setIsActive(false);
        userRepository.save(user);
        log.info("User marked as inactive (soft delete) with ID: {}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }


    @Override
    @Transactional(readOnly = true)
    public User findUserEntityByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    @Override
    @Transactional(readOnly = true)
    public User findUserEntityById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));
    }
}