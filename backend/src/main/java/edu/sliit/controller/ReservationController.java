package edu.sliit.controller;

import edu.sliit.dto.request.CreateReservationRequestDTO;
import edu.sliit.dto.request.UpdateReservationRequestDTO;
import edu.sliit.dto.response.ReservationResponseDTO;
import edu.sliit.security.UserPrincipal;
import edu.sliit.service.ReservationService;
import edu.sliit.util.StandardResponseDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reservations")
@RequiredArgsConstructor
@Slf4j
public class ReservationController {

    private final ReservationService reservationService;

    // ===== CUSTOMER ENDPOINTS =====

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<StandardResponseDTO> createReservation(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody CreateReservationRequestDTO request) {

        Long customerId = userPrincipal.getUser().getId();
        log.info("Creating reservation for customer: {}", customerId);

        ReservationResponseDTO reservation = reservationService.createReservation(customerId, request);

        return new ResponseEntity<>(
                new StandardResponseDTO(201, "Reservation created successfully and awaiting approval", reservation),
                HttpStatus.CREATED
        );
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'HOTEL_MANAGER', 'ADMIN')")
    public ResponseEntity<StandardResponseDTO> getReservationById(@PathVariable Long id) {
        log.info("Fetching reservation: {}", id);

        ReservationResponseDTO reservation = reservationService.getReservationById(id);

        return new ResponseEntity<>(
                new StandardResponseDTO(200, "Reservation retrieved successfully", reservation),
                HttpStatus.OK
        );
    }

    @GetMapping("/customer/my-reservations")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<StandardResponseDTO> getMyReservations(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        Long customerId = userPrincipal.getUser().getId();
        log.info("Fetching reservations for customer: {}", customerId);

        List<ReservationResponseDTO> reservations = reservationService.getReservationsByCustomer(customerId);

        return new ResponseEntity<>(
                new StandardResponseDTO(200, "Reservations retrieved successfully", reservations),
                HttpStatus.OK
        );
    }

    @GetMapping("/customer/my-reservations/status/{status}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<StandardResponseDTO> getMyReservationsByStatus(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable String status) {

        Long customerId = userPrincipal.getUser().getId();
        log.info("Fetching reservations for customer: {} with status: {}", customerId, status);

        List<ReservationResponseDTO> reservations = reservationService.getReservationsByCustomerAndStatus(customerId, status);

        return new ResponseEntity<>(
                new StandardResponseDTO(200, "Reservations retrieved successfully", reservations),
                HttpStatus.OK
        );
    }

    @GetMapping("/customer/completed")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<StandardResponseDTO> getMyCompletedReservations(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        Long customerId = userPrincipal.getUser().getId();
        log.info("Fetching completed reservations for customer: {}", customerId);

        List<ReservationResponseDTO> reservations = reservationService.getReservationsByCustomerAndStatus(customerId, "COMPLETED");

        return new ResponseEntity<>(
                new StandardResponseDTO(200, "Completed reservations retrieved successfully", reservations),
                HttpStatus.OK
        );
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<StandardResponseDTO> cancelReservation(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        Long customerId = userPrincipal.getUser().getId();
        log.info("Cancelling reservation: {} for customer: {}", id, customerId);

        ReservationResponseDTO reservation = reservationService.cancelReservation(id);

        return new ResponseEntity<>(
                new StandardResponseDTO(200, "Reservation cancelled successfully", reservation),
                HttpStatus.OK
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<StandardResponseDTO> updateReservation(
            @PathVariable Long id,
            @RequestBody UpdateReservationRequestDTO request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        Long customerId = userPrincipal.getUser().getId();
        log.info("Updating reservation: {} for customer: {}", id, customerId);

        ReservationResponseDTO reservation = reservationService.updateReservation(id, request);

        return new ResponseEntity<>(
                new StandardResponseDTO(200, "Reservation updated successfully", reservation),
                HttpStatus.OK
        );
    }

    // ===== HOTEL MANAGER ENDPOINTS =====

    @GetMapping("/hotel/{hotelId}")
    @PreAuthorize("hasRole('HOTEL_MANAGER') or hasRole('ADMIN')")
    public ResponseEntity<StandardResponseDTO> getAllReservationsByHotel(
            @PathVariable Long hotelId) {

        log.info("Fetching all reservations for hotel: {}", hotelId);

        List<ReservationResponseDTO> reservations = reservationService.getAllReservationsByHotel(hotelId);

        return new ResponseEntity<>(
                new StandardResponseDTO(200, "Reservations retrieved successfully", reservations),
                HttpStatus.OK
        );
    }

    @GetMapping("/manager/pending-by-hotel/{hotelId}")
    @PreAuthorize("hasRole('HOTEL_MANAGER') or hasRole('ADMIN')")
    public ResponseEntity<StandardResponseDTO> getPendingReservationsByHotel(
            @PathVariable Long hotelId) {

        log.info("Fetching pending reservations for hotel: {}", hotelId);

        List<ReservationResponseDTO> reservations = reservationService.getPendingReservationsByHotel(hotelId);

        return new ResponseEntity<>(
                new StandardResponseDTO(200, "Pending reservations retrieved successfully", reservations),
                HttpStatus.OK
        );
    }

    @GetMapping("/manager/pending-by-venue/{venueId}")
    @PreAuthorize("hasRole('HOTEL_MANAGER') or hasRole('ADMIN')")
    public ResponseEntity<StandardResponseDTO> getPendingReservationsByVenue(
            @PathVariable Long venueId) {

        log.info("Fetching pending reservations for venue: {}", venueId);

        List<ReservationResponseDTO> reservations = reservationService.getPendingReservationsByVenue(venueId);

        return new ResponseEntity<>(
                new StandardResponseDTO(200, "Pending reservations retrieved successfully", reservations),
                HttpStatus.OK
        );
    }

    @GetMapping("/manager/venue/{venueId}/status/{status}")
    @PreAuthorize("hasRole('HOTEL_MANAGER') or hasRole('ADMIN')")
    public ResponseEntity<StandardResponseDTO> getReservationsByVenueAndStatus(
            @PathVariable Long venueId,
            @PathVariable String status) {

        log.info("Fetching reservations for venue: {} with status: {}", venueId, status);

        List<ReservationResponseDTO> reservations = reservationService.getReservationsByVenueAndStatus(venueId, status);

        return new ResponseEntity<>(
                new StandardResponseDTO(200, "Reservations retrieved successfully", reservations),
                HttpStatus.OK
        );
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('HOTEL_MANAGER') or hasRole('ADMIN')")
    public ResponseEntity<StandardResponseDTO> approveReservation(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        Long hotelManagerId = userPrincipal.getUser().getId();
        log.info("Approving reservation: {} by manager: {}", id, hotelManagerId);

        ReservationResponseDTO reservation = reservationService.approveReservation(id, hotelManagerId);

        return new ResponseEntity<>(
                new StandardResponseDTO(200, "Reservation approved successfully", reservation),
                HttpStatus.OK
        );
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('HOTEL_MANAGER') or hasRole('ADMIN')")
    public ResponseEntity<StandardResponseDTO> rejectReservation(
            @PathVariable Long id,
            @RequestParam String rejectionReason,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        Long hotelManagerId = userPrincipal.getUser().getId();
        log.info("Rejecting reservation: {} by manager: {}", id, hotelManagerId);

        ReservationResponseDTO reservation = reservationService.rejectReservation(id, hotelManagerId, rejectionReason);

        return new ResponseEntity<>(
                new StandardResponseDTO(200, "Reservation rejected successfully", reservation),
                HttpStatus.OK
        );
    }

    @PostMapping("/{id}/complete")
    @PreAuthorize("hasRole('HOTEL_MANAGER') or hasRole('ADMIN')")
    public ResponseEntity<StandardResponseDTO> completeReservation(
            @PathVariable Long id) {

        log.info("Marking reservation as completed: {}", id);

        ReservationResponseDTO reservation = reservationService.completeReservation(id);

        return new ResponseEntity<>(
                new StandardResponseDTO(200, "Reservation marked as completed successfully", reservation),
                HttpStatus.OK
        );
    }

    // ===== ADMIN ENDPOINTS =====

    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StandardResponseDTO> getAllReservations() {
        log.info("Admin fetching all reservations");

        List<ReservationResponseDTO> reservations = reservationService.getAllReservations();

        return new ResponseEntity<>(
                new StandardResponseDTO(200, "All reservations retrieved successfully", reservations),
                HttpStatus.OK
        );
    }

    @GetMapping("/admin/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StandardResponseDTO> getAllReservationsByStatus(
            @PathVariable String status) {

        log.info("Admin fetching all reservations with status: {}", status);

        List<ReservationResponseDTO> reservations = reservationService.getAllReservationsByStatus(status);

        return new ResponseEntity<>(
                new StandardResponseDTO(200, "Reservations retrieved successfully", reservations),
                HttpStatus.OK
        );
    }
}
