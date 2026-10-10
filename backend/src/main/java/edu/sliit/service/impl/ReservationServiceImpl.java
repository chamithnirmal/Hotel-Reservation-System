package edu.sliit.service.impl;

import edu.sliit.dto.request.CreateReservationRequestDTO;
import edu.sliit.dto.request.UpdateReservationRequestDTO;
import edu.sliit.dto.response.ReservationResponseDTO;
import edu.sliit.entity.*;
import edu.sliit.exception.InvalidRequestException;
import edu.sliit.exception.ResourceNotFoundException;
import edu.sliit.repository.EventPackageRepository;
import edu.sliit.repository.PackagePriceRepository;
import edu.sliit.repository.ReservationRepository;
import edu.sliit.repository.UserRepository;
import edu.sliit.repository.VenueRepository;
import edu.sliit.service.ReservationService;
import edu.sliit.service.VenueAvailabilityService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import edu.sliit.service.EmailService;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ReservationServiceImpl implements ReservationService {

    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;
    private final VenueRepository venueRepository;
    private final EventPackageRepository eventPackageRepository;
    private final PackagePriceRepository packagePriceRepository;
    private final VenueAvailabilityService venueAvailabilityService;
    private final EmailService emailService;

    @Override
    public ReservationResponseDTO createReservation(Long customerId, CreateReservationRequestDTO request) {
        log.info("Creating reservation for customer: {} with venue: {}", customerId, request.getVenueId());


        validateCreateReservationRequest(request);


        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + customerId));

        Venue venue = venueRepository.findById(request.getVenueId())
                .orElseThrow(() -> new ResourceNotFoundException("Venue not found with ID: " + request.getVenueId()));

        EventPackage eventPackage = eventPackageRepository.findById(request.getEventPackageId())
                .orElseThrow(() -> new ResourceNotFoundException("Event package not found with ID: " + request.getEventPackageId()));

        // Validate package belongs to the venue
        if (!eventPackage.getVenue().getId().equals(venue.getId())) {
            throw new InvalidRequestException("Event package does not belong to the selected venue");
        }

        // Validate event date is in future
        if (request.getEventDate().isBefore(LocalDate.now())) {
            throw new InvalidRequestException("Event date cannot be in the past");
        }

        // Check venue availability
        if (!venueAvailabilityService.isVenueAvailable(venue.getId(), request.getEventDate())) {
            throw new InvalidRequestException("Venue is not available on the selected date");
        }


        BigDecimal totalPrice = calculateTotalPrice(eventPackage, request.getGuestCount());


        Reservation reservation = Reservation.builder()
                .customer(customer)
                .venue(venue)
                .eventPackage(eventPackage)
                .eventDate(request.getEventDate())
                .guestCount(request.getGuestCount())
                .contactPhone(request.getContactPhone())
                .totalPrice(totalPrice)
                .status(ReservationStatus.PENDING)
                .build();

        Reservation savedReservation = reservationRepository.save(reservation);
        log.info("Reservation created successfully with ID: {} (status: PENDING)", savedReservation.getId());


        sendBookingEmailsAsync(customer, venue, request, totalPrice);

        return mapToResponse(savedReservation);
    }


    private void sendBookingEmailsAsync(User customer, Venue venue, CreateReservationRequestDTO request, BigDecimal totalPrice) {
        // Extract all data BEFORE async thread runs (while transaction is still active)
        String customerEmail = customer.getEmail();
        String customerName = customer.getName();
        String venueName = venue.getVenueName();
        String managerEmail = venue.getHotel().getManager().getEmail();
        String managerName = venue.getHotel().getManager().getName();
        String customerPhone = customer.getPhoneNumber();
        String eventDate = request.getEventDate().toString();
        Integer guestCount = request.getGuestCount();
        String totalPriceStr = totalPrice.toString();

        new Thread(() -> {
            try {
                log.info("Sending booking confirmation emails for customer: {}", customer.getId());
                
                // Send booking confirmation email to customer
                emailService.sendBookingConfirmationEmail(
                        customerEmail,
                        customerName,
                        venueName,
                        eventDate,
                        guestCount,
                        totalPriceStr
                );

                // Send alert email to hotel manager
                emailService.sendManagerAlertEmail(
                        managerEmail,
                        customerName,
                        customerEmail,
                        customerPhone,
                        venueName,
                        eventDate,
                        guestCount
                );

                log.info("Booking confirmation emails sent successfully for customer: {}", customer.getId());
            } catch (Exception e) {
                log.error("Failed to send booking confirmation emails for customer: {}", customer.getId(), e);

            }
        }).start();
    }

    @Override
    @Transactional(readOnly = true)
    public ReservationResponseDTO getReservationById(Long reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with ID: " + reservationId));

        return mapToResponse(reservation);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReservationResponseDTO> getReservationsByCustomer(Long customerId) {

        userRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + customerId));

        List<Reservation> reservations = reservationRepository.findReservationsByCustomerOrderByCreatedAtDesc(customerId);


        for (Reservation r : reservations) {
            r.getCustomer().getName();
            r.getVenue().getVenueName();
            r.getEventPackage().getPackageName();
            r.getEventPackage().getEventType();
        }

        return reservations.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReservationResponseDTO> getReservationsByCustomerAndStatus(Long customerId, String status) {

        userRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + customerId));

        ReservationStatus reservationStatus = ReservationStatus.valueOf(status.toUpperCase());

        List<Reservation> reservations = reservationRepository.findByCustomerIdAndStatus(customerId, reservationStatus);

        return reservations.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ReservationResponseDTO updateReservation(Long reservationId, UpdateReservationRequestDTO request) {
        log.info("Updating reservation: {}", reservationId);

        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with ID: " + reservationId));

        // Can only update PENDING reservations
        if (reservation.getStatus() != ReservationStatus.PENDING) {
            throw new InvalidRequestException("Can only update reservations with PENDING status. Current status: " + reservation.getStatus());
        }

        // Validate input
        if (request.getEventDate() == null || request.getGuestCount() == null || request.getGuestCount() < 1) {
            throw new InvalidRequestException("Event date and guest count are required");
        }

        if (request.getContactPhone() == null || request.getContactPhone().trim().isEmpty()) {
            throw new InvalidRequestException("Contact phone is required");
        }

        // Update fields
        reservation.setEventDate(request.getEventDate());
        reservation.setGuestCount(request.getGuestCount());
        reservation.setContactPhone(request.getContactPhone().trim());
        reservation.setUpdatedAt(LocalDateTime.now());

        Reservation updatedReservation = reservationRepository.save(reservation);
        log.info("Reservation updated successfully: {}", reservationId);

        return mapToResponse(updatedReservation);
    }

    @Override
    public ReservationResponseDTO cancelReservation(Long reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with ID: " + reservationId));

        if (reservation.getStatus() == ReservationStatus.CANCELLED) {
            throw new InvalidRequestException("Reservation is already cancelled");
        }

        if (reservation.getStatus() == ReservationStatus.COMPLETED) {
            throw new InvalidRequestException("Cannot cancel a completed reservation");
        }

        // Store the old status BEFORE changing it (needed to check if we need to release venue)
        ReservationStatus oldStatus = reservation.getStatus();

        // Change status to CANCELLED
        reservation.setStatus(ReservationStatus.CANCELLED);
        Reservation updatedReservation = reservationRepository.save(reservation);
        log.info("Reservation cancelled with ID: {}", reservationId);

        // Send cancellation email to customer
        emailService.sendCancellationNotificationEmail(
                reservation.getCustomer().getEmail(),
                reservation.getCustomer().getName(),
                reservation.getVenue().getVenueName(),
                reservation.getEventDate().toString()
        );

        // Release the venue date only if the reservation was APPROVED before cancellation
        if (ReservationStatus.APPROVED == oldStatus) {
            try {
                venueAvailabilityService.cancelVenueDate(reservation.getVenue().getId(), reservation.getEventDate());
                log.info("Venue date released for reservation ID: {}", reservationId);
            } catch (Exception e) {
                log.error("Failed to release venue date for reservation ID: {}", reservationId, e);
                throw new InvalidRequestException("Failed to cancel reservation: " + e.getMessage());
            }
        }

        return mapToResponse(updatedReservation);
    }

    @Override
    @Transactional
    public ReservationResponseDTO approveReservation(Long reservationId, Long hotelManagerId) {
        log.info("Approving reservation ID: {} by manager: {}", reservationId, hotelManagerId);

        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with ID: " + reservationId));

        User hotelManager = userRepository.findById(hotelManagerId)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel manager not found with ID: " + hotelManagerId));

        if (reservation.getStatus() != ReservationStatus.PENDING) {
            throw new InvalidRequestException("Only PENDING reservations can be approved. Current status: " + reservation.getStatus());
        }

        // Book the venue date
        try {
            venueAvailabilityService.bookVenueDate(reservation.getVenue().getId(), reservation.getEventDate());
            log.info("Venue date booked for reservation ID: {}", reservationId);
        } catch (Exception e) {
            log.error("Failed to book venue date for reservation ID: {}", reservationId, e);
            throw new InvalidRequestException("Failed to approve reservation: " + e.getMessage());
        }


        reservation.setStatus(ReservationStatus.APPROVED);
        reservation.setApprovedBy(hotelManager);
        reservation.setApprovedAt(LocalDateTime.now());
        Reservation updatedReservation = reservationRepository.save(reservation);

        log.info("Reservation approved successfully with ID: {}", updatedReservation.getId());


        String customerEmail = updatedReservation.getCustomer().getEmail();
        String customerName = updatedReservation.getCustomer().getName();
        String venueName = updatedReservation.getVenue().getVenueName();
        String eventDate = updatedReservation.getEventDate().toString();


        sendApprovalEmailAsync(customerEmail, customerName, venueName, eventDate, updatedReservation.getId());

        return mapToResponse(updatedReservation);
    }


    private void sendApprovalEmailAsync(String customerEmail, String customerName, String venueName, String eventDate, Long reservationId) {
        new Thread(() -> {
            try {
                log.info("Sending approval email for reservation ID: {}", reservationId);
                emailService.sendApprovalNotificationEmail(
                        customerEmail,
                        customerName,
                        venueName,
                        eventDate
                );
                log.info("Approval email sent successfully for reservation ID: {}", reservationId);
            } catch (Exception e) {
                log.error("Failed to send approval email for reservation ID: {}", reservationId, e);
            }
        }).start();
    }

    @Override
    @Transactional
    public ReservationResponseDTO rejectReservation(Long reservationId, Long hotelManagerId, String rejectionReason) {
        log.info("Rejecting reservation ID: {} by manager: {}", reservationId, hotelManagerId);

        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with ID: " + reservationId));

        User hotelManager = userRepository.findById(hotelManagerId)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel manager not found with ID: " + hotelManagerId));

        if (reservation.getStatus() != ReservationStatus.PENDING) {
            throw new InvalidRequestException("Only PENDING reservations can be rejected. Current status: " + reservation.getStatus());
        }

        if (rejectionReason == null || rejectionReason.trim().isEmpty()) {
            throw new InvalidRequestException("Rejection reason is required");
        }

        reservation.setStatus(ReservationStatus.REJECTED);
        reservation.setApprovedBy(hotelManager);
        reservation.setApprovedAt(LocalDateTime.now());
        reservation.setRejectionReason(rejectionReason);
        Reservation updatedReservation = reservationRepository.save(reservation);

        log.info("Reservation rejected successfully with ID: {}", updatedReservation.getId());


        String customerEmail = updatedReservation.getCustomer().getEmail();
        String customerName = updatedReservation.getCustomer().getName();
        String venueName = updatedReservation.getVenue().getVenueName();
        String rejectionMsg = updatedReservation.getRejectionReason();


        sendRejectionEmailAsync(customerEmail, customerName, venueName, rejectionMsg, updatedReservation.getId());

        return mapToResponse(updatedReservation);
    }

    private void sendRejectionEmailAsync(String customerEmail, String customerName, String venueName, String rejectionReason, Long reservationId) {
        new Thread(() -> {
            try {
                log.info("Sending rejection email for reservation ID: {}", reservationId);
                emailService.sendRejectionNotificationEmail(
                        customerEmail,
                        customerName,
                        venueName,
                        rejectionReason
                );
                log.info("Rejection email sent successfully for reservation ID: {}", reservationId);
            } catch (Exception e) {
                log.error("Failed to send rejection email for reservation ID: {}", reservationId, e);
            }
        }).start();
    }

    @Override
    @Transactional
    public ReservationResponseDTO completeReservation(Long reservationId) {
        log.info("Marking reservation as completed: {}", reservationId);

        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with ID: " + reservationId));

        if (reservation.getStatus() != ReservationStatus.APPROVED) {
            throw new InvalidRequestException("Only APPROVED reservations can be marked as completed. Current status: " + reservation.getStatus());
        }


        reservation.setStatus(ReservationStatus.COMPLETED);
        Reservation updatedReservation = reservationRepository.save(reservation);

        log.info("Reservation marked as completed with ID: {}", updatedReservation.getId());


        String customerEmail = updatedReservation.getCustomer().getEmail();
        String customerName = updatedReservation.getCustomer().getName();
        String venueName = updatedReservation.getVenue().getVenueName();
        String eventDate = updatedReservation.getEventDate().toString();


        sendCompletionEmailAsync(customerEmail, customerName, venueName, eventDate, updatedReservation.getId());

        return mapToResponse(updatedReservation);
    }


    private void sendCompletionEmailAsync(String customerEmail, String customerName, String venueName, String eventDate, Long reservationId) {
        new Thread(() -> {
            try {
                log.info("Sending completion email for reservation ID: {}", reservationId);
                emailService.sendCompletionNotificationEmail(
                        customerEmail,
                        customerName,
                        venueName,
                        eventDate
                );
                log.info("Completion email sent successfully for reservation ID: {}", reservationId);
            } catch (Exception e) {
                log.error("Failed to send completion email for reservation ID: {}", reservationId, e);
            }
        }).start();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReservationResponseDTO> getPendingReservationsByHotel(Long hotelId) {
        log.info("Fetching pending reservations for hotel: {}", hotelId);

        List<Reservation> reservations = reservationRepository.findPendingReservationsByHotel(hotelId);
        log.info("Found {} pending reservations for hotel: {}", reservations.size(), hotelId);


        for (Reservation r : reservations) {
            r.getCustomer().getName();  // Trigger load
            r.getVenue().getVenueName(); // Trigger load
            r.getVenue().getHotel().getId(); // Trigger load
            r.getEventPackage().getPackageName(); // Trigger load
            r.getEventPackage().getEventType(); // Trigger load event type
        }

        return reservations.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReservationResponseDTO> getAllReservationsByHotel(Long hotelId) {
        log.info("Fetching all reservations for hotel: {}", hotelId);

        List<Reservation> reservations = reservationRepository.findAllReservationsByHotel(hotelId);
        log.info("Found {} reservations for hotel: {}", reservations.size(), hotelId);


        for (Reservation r : reservations) {
            r.getCustomer().getName();
            r.getVenue().getVenueName();
            r.getVenue().getHotel().getId();
            r.getEventPackage().getPackageName();
            r.getEventPackage().getEventType();
        }

        return reservations.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReservationResponseDTO> getPendingReservationsByVenue(Long venueId) {
        log.info("Fetching pending reservations for venue: {}", venueId);


        venueRepository.findById(venueId)
                .orElseThrow(() -> new ResourceNotFoundException("Venue not found with ID: " + venueId));

        List<Reservation> reservations = reservationRepository.findPendingReservationsByVenue(venueId);


        for (Reservation r : reservations) {
            r.getCustomer().getName();
            r.getVenue().getVenueName();
            r.getEventPackage().getPackageName();
            r.getEventPackage().getEventType();
        }

        return reservations.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReservationResponseDTO> getReservationsByVenueAndStatus(Long venueId, String status) {
        log.info("Fetching reservations for venue: {} with status: {}", venueId, status);


        venueRepository.findById(venueId)
                .orElseThrow(() -> new ResourceNotFoundException("Venue not found with ID: " + venueId));

        ReservationStatus reservationStatus = ReservationStatus.valueOf(status.toUpperCase());
        List<Reservation> reservations = reservationRepository.findByVenueAndStatusOrderByCreatedAtDesc(venueId, reservationStatus);


        for (Reservation r : reservations) {
            r.getCustomer().getName();
            r.getVenue().getVenueName();
            r.getEventPackage().getPackageName();
            r.getEventPackage().getEventType();
        }

        return reservations.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReservationResponseDTO> getAllReservations() {
        log.info("Admin fetching all reservations");

        List<Reservation> reservations = reservationRepository.findAll();
        log.info("Found {} total reservations", reservations.size());

        for (Reservation r : reservations) {
            r.getCustomer().getName();
            r.getVenue().getVenueName();
            r.getVenue().getHotel().getId();
            r.getVenue().getHotel().getHotelName();
            r.getEventPackage().getPackageName();
            r.getEventPackage().getEventType();
        }

        return reservations.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReservationResponseDTO> getAllReservationsByStatus(String status) {
        log.info("Admin fetching all reservations with status: {}", status);

        ReservationStatus reservationStatus = ReservationStatus.valueOf(status.toUpperCase());
        List<Reservation> reservations = reservationRepository.findByStatus(reservationStatus);
        log.info("Found {} reservations with status: {}", reservations.size(), status);


        for (Reservation r : reservations) {
            r.getCustomer().getName();
            r.getVenue().getVenueName();
            r.getVenue().getHotel().getId();
            r.getVenue().getHotel().getHotelName();
            r.getEventPackage().getPackageName();
            r.getEventPackage().getEventType();
        }

        return reservations.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private void validateCreateReservationRequest(CreateReservationRequestDTO request) {
        if (request.getVenueId() == null) {
            throw new InvalidRequestException("Venue ID is required");
        }

        if (request.getEventPackageId() == null) {
            throw new InvalidRequestException("Event package ID is required");
        }

        if (request.getEventDate() == null) {
            throw new InvalidRequestException("Event date is required");
        }

        if (request.getGuestCount() == null || request.getGuestCount() <= 0) {
            throw new InvalidRequestException("Guest count must be greater than 0");
        }

        if (request.getContactPhone() == null || request.getContactPhone().trim().isEmpty()) {
            throw new InvalidRequestException("Contact phone is required");
        }
    }

    private BigDecimal calculateTotalPrice(EventPackage eventPackage, Integer guestCount) {

        var packagePrice = packagePriceRepository.findByEventPackageAndGuestCount(eventPackage, guestCount);

        if (packagePrice.isPresent()) {
            return packagePrice.get().getTotalPrice();
        }


        List<PackagePrice> allPrices = packagePriceRepository.findByEventPackage(eventPackage);

        if (allPrices.isEmpty()) {
            throw new InvalidRequestException("No pricing available for the selected package");
        }


        PackagePrice closestPrice = allPrices.stream()
                .filter(price -> price.getGuestCount() >= guestCount)
                .min((p1, p2) -> Integer.compare(p1.getGuestCount(), p2.getGuestCount()))
                .orElseGet(() -> allPrices.get(allPrices.size() - 1));

        return closestPrice.getTotalPrice();
    }

    private ReservationResponseDTO mapToResponse(Reservation reservation) {
        return ReservationResponseDTO.builder()
                .id(reservation.getId())
                .customerId(reservation.getCustomer().getId())
                .customerName(reservation.getCustomer().getName())
                .customerEmail(reservation.getCustomer().getEmail())
                .customerPhone(reservation.getCustomer().getPhoneNumber())
                .hotelId(reservation.getVenue().getHotel().getId())
                .hotelName(reservation.getVenue().getHotel().getHotelName())
                .venueId(reservation.getVenue().getId())
                .venueName(reservation.getVenue().getVenueName())
                .eventPackageId(reservation.getEventPackage().getId())
                .eventPackageName(reservation.getEventPackage().getPackageName())
                .eventType(reservation.getEventPackage().getEventType().toString())
                .eventDate(reservation.getEventDate())
                .guestCount(reservation.getGuestCount())
                .contactPhone(reservation.getContactPhone())
                .totalPrice(reservation.getTotalPrice())
                .status(reservation.getStatus().toString())
                .createdAt(reservation.getCreatedAt())
                .updatedAt(reservation.getUpdatedAt())
                .build();
    }
}
