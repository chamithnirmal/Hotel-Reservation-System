package edu.sliit.exception;

import edu.sliit.util.StandardResponseDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<StandardResponseDTO> handleResourceNotFoundException(ResourceNotFoundException ex) {
        log.error("Resource not found: {}", ex.getMessage());
        return new ResponseEntity<>(
            new StandardResponseDTO(404, ex.getMessage(), null),
            HttpStatus.NOT_FOUND
        );
    }

    @ExceptionHandler(InvalidRequestException.class)
    public ResponseEntity<StandardResponseDTO> handleInvalidRequestException(InvalidRequestException ex) {
        log.error("Invalid request: {}", ex.getMessage());
        return new ResponseEntity<>(
            new StandardResponseDTO(400, ex.getMessage(), null),
            HttpStatus.BAD_REQUEST
        );
    }

    @ExceptionHandler(UnauthorizedAccessException.class)
    public ResponseEntity<StandardResponseDTO> handleUnauthorizedAccessException(UnauthorizedAccessException ex) {
        log.error("Unauthorized access: {}", ex.getMessage());
        return new ResponseEntity<>(
            new StandardResponseDTO(401, ex.getMessage(), null),
            HttpStatus.UNAUTHORIZED
        );
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<StandardResponseDTO> handleBadCredentialsException(BadCredentialsException ex) {
        log.error("Bad credentials: {}", ex.getMessage());
        return new ResponseEntity<>(
            new StandardResponseDTO(401, "Invalid email or password", null),
            HttpStatus.UNAUTHORIZED
        );
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<StandardResponseDTO> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        
        log.error("Validation errors: {}", errors);
        return new ResponseEntity<>(
            new StandardResponseDTO(400, "Validation failed", errors),
            HttpStatus.BAD_REQUEST
        );
    }

    @ExceptionHandler(org.springframework.web.servlet.resource.NoResourceFoundException.class)
    public ResponseEntity<StandardResponseDTO> handleNoResourceFound(
            org.springframework.web.servlet.resource.NoResourceFoundException ex) {
        log.error("Endpoint not found: {}", ex.getMessage());
        return new ResponseEntity<>(
            new StandardResponseDTO(404, "Endpoint not found: " + ex.getResourcePath(), null),
            HttpStatus.NOT_FOUND
        );
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<StandardResponseDTO> handleGenericException(Exception ex) {
        log.error("Unexpected error occurred: {}", ex.getMessage(), ex);
        return new ResponseEntity<>(
            new StandardResponseDTO(500, "An unexpected error occurred: " + ex.getMessage(), null),
            HttpStatus.INTERNAL_SERVER_ERROR
        );
    }
}