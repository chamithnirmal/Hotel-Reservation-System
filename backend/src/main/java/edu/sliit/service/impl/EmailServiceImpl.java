package edu.sliit.service.impl;

import edu.sliit.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Override
    public void sendBookingConfirmationEmail(String to, String customerName, String venueName, String eventDate, Integer guestCount, String totalPrice) {
        String subject = "Booking Confirmation - Your Reservation is Pending";
        String body = "Dear " + customerName + ",\n\n" +
                "Thank you for your booking request!\n\n" +
                "Venue: " + venueName + "\n" +
                "Date: " + eventDate + "\n" +
                "Guest Count: " + guestCount + "\n" +
                "Total Price: Rs. " + totalPrice + "\n\n" +
                "Status: PENDING - Awaiting hotel manager approval\n\n" +
                "We'll notify you once the hotel reviews your booking.\n\n" +
                "Best regards,\n" +
                "Hotel Reservation System";

        sendEmail(to, subject, body);
    }

    @Override
    public void sendApprovalNotificationEmail(String to, String customerName, String venueName, String eventDate) {
        String subject = "Booking Approved!  - Reservation Confirmed";
        String body = "Dear " + customerName + ",\n\n" +
                "Great news! Your booking has been approved!\n\n" +
                "Venue: " + venueName + "\n" +
                "Date: " + eventDate + "\n\n" +
                "Your reservation is now confirmed. Please check your booking details and prepare accordingly.\n\n" +
                "Best regards,\n" +
                "Hotel Reservation System";

        sendEmail(to, subject, body);
    }

    @Override
    public void sendRejectionNotificationEmail(String to, String customerName, String venueName, String rejectionReason) {
        String subject = "Booking Rejected  - Reason Provided";
        String body = "Dear " + customerName + ",\n\n" +
                "Unfortunately, your booking has been rejected.\n\n" +
                "Venue: " + venueName + "\n" +
                "Reason: " + rejectionReason + "\n\n" +
                "You can try booking with:\n" +
                "- Different date\n" +
                "- Different venue\n" +
                "- Different package\n\n" +
                "Please visit our website to place a new booking.\n\n" +
                "Best regards,\n" +
                "Hotel Reservation System";

        sendEmail(to, subject, body);
    }

    @Override
    public void sendCancellationNotificationEmail(String to, String customerName, String venueName, String eventDate) {
        String subject = "Booking Cancelled - Cancellation Confirmation";
        String body = "Dear " + customerName + ",\n\n" +
                "Your booking has been successfully cancelled.\n\n" +
                "Venue: " + venueName + "\n" +
                "Date: " + eventDate + "\n" +
                "Cancellation Date: " + java.time.LocalDate.now() + "\n\n" +
                "We hope to serve you in the future.\n\n" +
                "Best regards,\n" +
                "Hotel Reservation System";

        sendEmail(to, subject, body);
    }

    @Override
    public void sendCompletionNotificationEmail(String to, String customerName, String venueName, String eventDate) {
        String subject = "Event Completed - Thank You! ";
        String body = "Dear " + customerName + ",\n\n" +
                "Your event has been successfully completed!\n\n" +
                "Venue: " + venueName + "\n" +
                "Date: " + eventDate + "\n\n" +
                "Thank you for choosing us. We hope your event was wonderful.\n\n" +
                "Please consider leaving a review of your experience.\n\n" +
                "Best regards,\n" +
                "Hotel Reservation System";

        sendEmail(to, subject, body);
    }

    @Override
    public void sendManagerAlertEmail(String to, String customerName, String customerEmail, String customerPhone, String venueName, String eventDate, Integer guestCount) {
        String subject = "New Booking Request - Action Required";
        String body = "Dear Manager,\n\n" +
                "A new booking request has been received and awaits your approval.\n\n" +
                "Customer Details:\n" +
                "Name: " + customerName + "\n" +
                "Email: " + customerEmail + "\n" +
                "Phone: " + customerPhone + "\n\n" +
                "Booking Details:\n" +
                "Venue: " + venueName + "\n" +
                "Date: " + eventDate + "\n" +
                "Guest Count: " + guestCount + "\n\n" +
                "Please review and approve or reject this booking as soon as possible.\n\n" +
                "Login to dashboard: [Admin URL]\n\n" +
                "Best regards,\n" +
                "Hotel Reservation System";

        sendEmail(to, subject, body);
    }

    private void sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            message.setFrom(fromEmail);

            mailSender.send(message);
            log.info("Email sent successfully to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send email to: {} - Error: {}", to, e.getMessage(), e);
        }
    }
}
