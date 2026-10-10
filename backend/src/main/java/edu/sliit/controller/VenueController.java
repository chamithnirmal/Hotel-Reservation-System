package edu.sliit.controller;

import edu.sliit.dto.request.CreateVenueRequestDTO;
import edu.sliit.dto.response.VenueResponseDTO;
import edu.sliit.service.VenueService;
import edu.sliit.util.StandardResponseDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/v1/venues")
@RequiredArgsConstructor
@Slf4j
public class VenueController {

    private final VenueService venueService;

    @GetMapping
    public ResponseEntity<StandardResponseDTO> getAllVenues() {
        log.info("Fetching all venues");

        List<VenueResponseDTO> venues = venueService.getAllVenues();

        return new ResponseEntity<>(
                new StandardResponseDTO(200, "Venues retrieved successfully", venues),
                HttpStatus.OK
        );
    }

    @PostMapping("/hotel/{hotelId}")
    @PreAuthorize("hasRole('HOTEL_MANAGER') or hasRole('ADMIN')")
    public ResponseEntity<StandardResponseDTO> createVenue(
            @PathVariable Long hotelId,
            @RequestBody CreateVenueRequestDTO request) {

        log.info("Creating venue for hotel: {}", hotelId);

        VenueResponseDTO venue = venueService.createVenue(hotelId, request);

        return new ResponseEntity<>(
                new StandardResponseDTO(201, "Venue created successfully", venue),
                HttpStatus.CREATED);
    }

    @PostMapping("/hotel/{hotelId}/with-image")
    @PreAuthorize("hasRole('HOTEL_MANAGER') or hasRole('ADMIN')")
    public ResponseEntity<StandardResponseDTO> createVenueWithImage(
            @PathVariable Long hotelId,
            @RequestParam("venueName") String venueName,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("capacity") Integer capacity,
            @RequestParam(value = "facilityIds", required = false) Set<Long> facilityIds,
            @RequestParam(value = "image", required = false) MultipartFile image) {

        log.info("Creating venue with image for hotel: {}", hotelId);

        CreateVenueRequestDTO request = new CreateVenueRequestDTO();
        request.setVenueName(venueName);
        request.setDescription(description);
        request.setCapacity(capacity);
        request.setFacilityIds(facilityIds != null ? facilityIds : new HashSet<>());

        if (image != null && !image.isEmpty()) {
            try {
                request.setImage(image.getBytes());
            } catch (Exception e) {
                log.error("Error processing image", e);
            }
        }

        VenueResponseDTO venue = venueService.createVenue(hotelId, request);

        return new ResponseEntity<>(
                new StandardResponseDTO(201, "Venue created successfully", venue),
                HttpStatus.CREATED
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<StandardResponseDTO> getVenueById(@PathVariable Long id) {
        VenueResponseDTO venue = venueService.getVenueById(id);

        return new ResponseEntity<>(
                new StandardResponseDTO(200, "Venue retrieved successfully", venue),
                HttpStatus.OK
        );
    }

    @GetMapping("/hotel/{hotelId}")
    public ResponseEntity<StandardResponseDTO> getVenuesByHotel(@PathVariable Long hotelId) {
        List<VenueResponseDTO> venues = venueService.getVenuesByHotel(hotelId);

        return new ResponseEntity<>(
                new StandardResponseDTO(200, "Venues retrieved successfully", venues),
                HttpStatus.OK
        );
    }

    @GetMapping("/hotel/{hotelId}/active")
    public ResponseEntity<StandardResponseDTO> getActiveVenuesByHotel(@PathVariable Long hotelId) {
        List<VenueResponseDTO> venues = venueService.getActiveVenuesByHotel(hotelId);

        return new ResponseEntity<>(
                new StandardResponseDTO(200, "Active venues retrieved successfully", venues),
                HttpStatus.OK
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('HOTEL_MANAGER') or hasRole('ADMIN')")
    public ResponseEntity<StandardResponseDTO> updateVenue(
            @PathVariable Long id,
            @RequestBody CreateVenueRequestDTO request) {

        log.info("Updating venue with ID: {}", id);

        VenueResponseDTO venue = venueService.updateVenue(id, request);

        return new ResponseEntity<>(
                new StandardResponseDTO(200, "Venue updated successfully", venue),
                HttpStatus.OK
        );
    }

    @PostMapping("/{id}/toggle-status")
    @PreAuthorize("hasRole('HOTEL_MANAGER') or hasRole('ADMIN')")
    public ResponseEntity<StandardResponseDTO> toggleVenueStatus(@PathVariable Long id) {
        log.info("Toggling venue status for ID: {}", id);

        VenueResponseDTO venue = venueService.toggleVenueStatus(id);

        return new ResponseEntity<>(
                new StandardResponseDTO(200, "Venue status toggled successfully", venue),
                HttpStatus.OK
        );
    }

    @PostMapping("/{venueId}/add-facilities")
    @PreAuthorize("hasRole('HOTEL_MANAGER') or hasRole('ADMIN')")
    public ResponseEntity<StandardResponseDTO> addFacilitiesToVenue(
            @PathVariable Long venueId,
            @RequestBody List<Long> facilityIds) {

        log.info("Adding facilities to venue: {}", venueId);

        VenueResponseDTO venue = venueService.addFacilitiesToVenue(venueId, facilityIds);

        return new ResponseEntity<>(
                new StandardResponseDTO(200, "Facilities added successfully", venue),
                HttpStatus.OK
        );
    }

    @PostMapping("/{venueId}/remove-facilities")
    @PreAuthorize("hasRole('HOTEL_MANAGER') or hasRole('ADMIN')")
    public ResponseEntity<StandardResponseDTO> removeFacilitiesFromVenue(
            @PathVariable Long venueId,
            @RequestBody List<Long> facilityIds) {

        log.info("Removing facilities from venue: {}", venueId);

        VenueResponseDTO venue = venueService.removeFacilitiesFromVenue(venueId, facilityIds);

        return new ResponseEntity<>(
                new StandardResponseDTO(200, "Facilities removed successfully", venue),
                HttpStatus.OK
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('HOTEL_MANAGER') or hasRole('ADMIN')")
    public ResponseEntity<StandardResponseDTO> deleteVenue(@PathVariable Long id) {
        log.info("Deleting venue with ID: {}", id);

        venueService.deleteVenue(id);

        return new ResponseEntity<>(
                new StandardResponseDTO(204, "Venue deleted successfully", null),
                HttpStatus.NO_CONTENT
        );
    }
}
