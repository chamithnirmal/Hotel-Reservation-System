package edu.sliit.controller;

import edu.sliit.dto.response.VenueAvailabilityDTO;
import edu.sliit.service.VenueAvailabilityService;
import edu.sliit.util.StandardResponseDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/venue-availability")
@RequiredArgsConstructor
@Slf4j
public class VenueAvailabilityController {

    private final VenueAvailabilityService venueAvailabilityService;

    @GetMapping("/check/{venueId}")
    public ResponseEntity<StandardResponseDTO> checkVenueAvailability(
            @PathVariable Long venueId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        boolean isAvailable = venueAvailabilityService.isVenueAvailable(venueId, date);

        String message = isAvailable ? "Venue is available on this date" : "Venue is not available on this date";

        return new ResponseEntity<>(
                new StandardResponseDTO(200, message, isAvailable),
                HttpStatus.OK
        );
    }

    @PostMapping("/book/{venueId}")
    @PreAuthorize("hasRole('HOTEL_MANAGER') or hasRole('ADMIN')")
    public ResponseEntity<StandardResponseDTO> bookVenueDate(
            @PathVariable Long venueId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        log.info("Booking venue: {} for date: {}", venueId, date);

        venueAvailabilityService.bookVenueDate(venueId, date);

        return new ResponseEntity<>(
                new StandardResponseDTO(200, "Venue date booked successfully", null),
                HttpStatus.OK
        );
    }

    @PostMapping("/cancel/{venueId}")
    @PreAuthorize("hasRole('HOTEL_MANAGER') or hasRole('ADMIN')")
    public ResponseEntity<StandardResponseDTO> cancelVenueDate(
            @PathVariable Long venueId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        log.info("Cancelling venue booking: {} for date: {}", venueId, date);

        venueAvailabilityService.cancelVenueDate(venueId, date);

        return new ResponseEntity<>(
                new StandardResponseDTO(200, "Venue booking cancelled successfully", null),
                HttpStatus.OK
        );
    }

    @GetMapping("/available/{venueId}")
    public ResponseEntity<StandardResponseDTO> getAvailableDates(
            @PathVariable Long venueId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        List<VenueAvailabilityDTO> availableDates = venueAvailabilityService.getAvailableDates(venueId, startDate, endDate);

        return new ResponseEntity<>(
                new StandardResponseDTO(200, "Available dates retrieved successfully", availableDates),
                HttpStatus.OK
        );
    }

    @GetMapping("/booked/{venueId}")
    @PreAuthorize("hasRole('HOTEL_MANAGER') or hasRole('ADMIN')")
    public ResponseEntity<StandardResponseDTO> getBookedDates(
            @PathVariable Long venueId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        List<VenueAvailabilityDTO> bookedDates = venueAvailabilityService.getBookedDates(venueId, startDate, endDate);

        return new ResponseEntity<>(
                new StandardResponseDTO(200, "Booked dates retrieved successfully", bookedDates),
                HttpStatus.OK
        );
    }
}
