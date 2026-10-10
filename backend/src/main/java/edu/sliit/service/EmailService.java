package edu.sliit.service;

public interface EmailService {
    
    void sendBookingConfirmationEmail(String to, String customerName, String venueName, String eventDate, Integer guestCount, String totalPrice);
    
    void sendApprovalNotificationEmail(String to, String customerName, String venueName, String eventDate);
    
    void sendRejectionNotificationEmail(String to, String customerName, String venueName, String rejectionReason);
    
    void sendCancellationNotificationEmail(String to, String customerName, String venueName, String eventDate);
    
    void sendCompletionNotificationEmail(String to, String customerName, String venueName, String eventDate);
    
    void sendManagerAlertEmail(String to, String customerName, String customerEmail, String customerPhone, String venueName, String eventDate, Integer guestCount);
}
