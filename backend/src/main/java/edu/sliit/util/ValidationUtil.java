package edu.sliit.util;

import java.util.regex.Pattern;

public class ValidationUtil {

    // Email validation
    public static boolean isValidEmail(String email) {
        String emailRegex = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$";
        return email != null && Pattern.matches(emailRegex, email);
    }

    // Phone number validation - 10 digits
    public static boolean isValidPhoneNumber(String phone) {
        String phoneRegex = "^[0-9]{10}$";
        return phone != null && Pattern.matches(phoneRegex, phone);
    }

    // Password validation - minimum 8 characters, 
    // at least one lowercase, one uppercase, and one digit
    public static boolean isValidPassword(String password) {
        if (password == null || password.length() < 8) {
            return false;
        }
        // Check for at least one lowercase letter
        if (!Pattern.matches(".*[a-z].*", password)) {
            return false;
        }
        // Check for at least one uppercase letter
        if (!Pattern.matches(".*[A-Z].*", password)) {
            return false;
        }
        // Check for at least one digit
        if (!Pattern.matches(".*\\d.*", password)) {
            return false;
        }
        return true;
    }

    // Name validation - minimum 2 characters
    public static boolean isValidName(String name) {
        return name != null && name.trim().length() >= 2;
    }

    // Check if string is not null or empty
    public static boolean isNotEmpty(String value) {
        return value != null && !value.trim().isEmpty();
    }

    // Check if string is not null and has specific length
    public static boolean isValidLength(String value, int minLength, int maxLength) {
        return value != null && value.length() >= minLength && value.length() <= maxLength;
    }

    // Check if passwords match
    public static boolean isPasswordsMatching(String password, String confirmPassword) {
        return password != null && password.equals(confirmPassword);
    }

    // Validate email format and return error message
    public static String getEmailValidationError(String email) {
        if (!isNotEmpty(email)) {
            return "Email is required";
        }
        if (!isValidEmail(email)) {
            return "Email format is invalid";
        }
        return null;
    }

    // Validate password and return error message
    public static String getPasswordValidationError(String password) {
        if (!isNotEmpty(password)) {
            return "Password is required";
        }
        if (password.length() < 8) {
            return "Password must be at least 8 characters long";
        }
        if (!Pattern.matches(".*[a-z].*", password)) {
            return "Password must contain at least one lowercase letter";
        }
        if (!Pattern.matches(".*[A-Z].*", password)) {
            return "Password must contain at least one uppercase letter";
        }
        if (!Pattern.matches(".*\\d.*", password)) {
            return "Password must contain at least one digit";
        }
        return null;
    }

    // Validate name and return error message
    public static String getNameValidationError(String name) {
        if (!isNotEmpty(name)) {
            return "Name is required";
        }
        if (!isValidName(name)) {
            return "Name must be at least 2 characters long";
        }
        return null;
    }

    // Validate phone number and return error message
    public static String getPhoneValidationError(String phone) {
        if (phone != null && !phone.isEmpty()) {
            if (!isValidPhoneNumber(phone)) {
                return "Phone number must be 10 digits";
            }
        }
        return null;
    }

    // Validate confirm password and return error message
    public static String getConfirmPasswordValidationError(String password, String confirmPassword) {
        if (!isNotEmpty(confirmPassword)) {
            return "Confirm password is required";
        }
        if (!isPasswordsMatching(password, confirmPassword)) {
            return "Passwords do not match";
        }
        return null;
    }
}