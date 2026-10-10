package edu.sliit.controller;

import edu.sliit.dto.request.CreateEventPackageRequestDTO;
import edu.sliit.dto.response.EventPackageResponseDTO;
import edu.sliit.dto.response.PackagePriceDTO;
import edu.sliit.entity.EventType;
import edu.sliit.service.EventPackageService;
import edu.sliit.util.StandardResponseDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/event-packages")
@RequiredArgsConstructor
@Slf4j
public class EventPackageController {

    private final EventPackageService eventPackageService;

    @PostMapping("/venue/{venueId}")
    @PreAuthorize("hasRole('HOTEL_MANAGER') or hasRole('ADMIN')")
    public ResponseEntity<StandardResponseDTO> createPackage(
            @PathVariable Long venueId,
            @RequestBody CreateEventPackageRequestDTO request) {

        log.info("Creating event package for venue: {}", venueId);

        EventPackageResponseDTO eventPackage = eventPackageService.createPackage(venueId, request);

        return new ResponseEntity<>(
                new StandardResponseDTO(201, "Event package created successfully", eventPackage),
                HttpStatus.CREATED
        );
    }

    @GetMapping
    public ResponseEntity<StandardResponseDTO> getAllPackages() {
        log.info("🔍 Fetching all event packages");

        List<EventPackageResponseDTO> packages = eventPackageService.getAllPackages();
        
        log.info("✅ Found {} event packages", packages.size());
        packages.forEach(pkg -> log.info("📦 Package: id={}, name={}, venue={}", pkg.getId(), pkg.getPackageName(), pkg.getVenueId()));

        return new ResponseEntity<>(
                new StandardResponseDTO(200, "Event packages retrieved successfully", packages),
                HttpStatus.OK
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<StandardResponseDTO> getPackageById(@PathVariable Long id) {
        EventPackageResponseDTO eventPackage = eventPackageService.getPackageById(id);

        return new ResponseEntity<>(
                new StandardResponseDTO(200, "Event package retrieved successfully", eventPackage),
                HttpStatus.OK
        );
    }

    @GetMapping("/venue/{venueId}")
    public ResponseEntity<StandardResponseDTO> getPackagesByVenue(@PathVariable Long venueId) {
        List<EventPackageResponseDTO> packages = eventPackageService.getPackagesByVenue(venueId);

        return new ResponseEntity<>(
                new StandardResponseDTO(200, "Event packages retrieved successfully", packages),
                HttpStatus.OK
        );
    }

    @GetMapping("/event-type/{eventType}")
    public ResponseEntity<StandardResponseDTO> getPackagesByEventType(@PathVariable EventType eventType) {
        List<EventPackageResponseDTO> packages = eventPackageService.getPackagesByEventType(eventType);

        return new ResponseEntity<>(
                new StandardResponseDTO(200, "Event packages by type retrieved successfully", packages),
                HttpStatus.OK
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('HOTEL_MANAGER') or hasRole('ADMIN')")
    public ResponseEntity<StandardResponseDTO> updatePackage(
            @PathVariable Long id,
            @RequestBody CreateEventPackageRequestDTO request) {

        log.info("Updating event package with ID: {}", id);

        EventPackageResponseDTO eventPackage = eventPackageService.updatePackage(id, request);

        return new ResponseEntity<>(
                new StandardResponseDTO(200, "Event package updated successfully", eventPackage),
                HttpStatus.OK
        );
    }

    @PostMapping("/{id}/toggle-status")
    @PreAuthorize("hasRole('HOTEL_MANAGER') or hasRole('ADMIN')")
    public ResponseEntity<StandardResponseDTO> togglePackageStatus(@PathVariable Long id) {
        log.info("Toggling package status for ID: {}", id);

        EventPackageResponseDTO eventPackage = eventPackageService.togglePackageStatus(id);

        return new ResponseEntity<>(
                new StandardResponseDTO(200, "Package status toggled successfully", eventPackage),
                HttpStatus.OK
        );
    }

    @PostMapping("/{packageId}/add-facilities")
    @PreAuthorize("hasRole('HOTEL_MANAGER') or hasRole('ADMIN')")
    public ResponseEntity<StandardResponseDTO> addFacilitiesToPackage(
            @PathVariable Long packageId,
            @RequestBody List<Long> facilityIds) {

        log.info("Adding facilities to package: {}", packageId);

        EventPackageResponseDTO eventPackage = eventPackageService.addFacilitiesToPackage(packageId, facilityIds);

        return new ResponseEntity<>(
                new StandardResponseDTO(200, "Facilities added successfully", eventPackage),
                HttpStatus.OK
        );
    }

    @PostMapping("/{packageId}/remove-facilities")
    @PreAuthorize("hasRole('HOTEL_MANAGER') or hasRole('ADMIN')")
    public ResponseEntity<StandardResponseDTO> removeFacilitiesFromPackage(
            @PathVariable Long packageId,
            @RequestBody List<Long> facilityIds) {

        log.info("Removing facilities from package: {}", packageId);

        EventPackageResponseDTO eventPackage = eventPackageService.removeFacilitiesFromPackage(packageId, facilityIds);

        return new ResponseEntity<>(
                new StandardResponseDTO(200, "Facilities removed successfully", eventPackage),
                HttpStatus.OK
        );
    }

    @PostMapping("/{packageId}/pricing")
    @PreAuthorize("hasRole('HOTEL_MANAGER') or hasRole('ADMIN')")
    public ResponseEntity<StandardResponseDTO> addPackagePrice(
            @PathVariable Long packageId,
            @RequestParam Integer guestCount,
            @RequestParam BigDecimal totalPrice) {

        log.info("Adding pricing for event package: {}", packageId);

        PackagePriceDTO packagePrice = eventPackageService.addPackagePrice(packageId, guestCount, totalPrice);

        return new ResponseEntity<>(
                new StandardResponseDTO(201, "Package pricing added successfully", packagePrice),
                HttpStatus.CREATED
        );
    }

    @PutMapping("/{packageId}/pricing/{priceId}")
    @PreAuthorize("hasRole('HOTEL_MANAGER') or hasRole('ADMIN')")
    public ResponseEntity<StandardResponseDTO> updatePackagePrice(
            @PathVariable Long packageId,
            @PathVariable Long priceId,
            @RequestParam Integer guestCount,
            @RequestParam BigDecimal totalPrice) {

        log.info("Updating pricing for package: {}, price ID: {}", packageId, priceId);

        PackagePriceDTO packagePrice = eventPackageService.updatePackagePrice(priceId, guestCount, totalPrice);

        return new ResponseEntity<>(
                new StandardResponseDTO(200, "Package pricing updated successfully", packagePrice),
                HttpStatus.OK
        );
    }

    @GetMapping("/{packageId}/pricing")
    public ResponseEntity<StandardResponseDTO> getPackagePricing(@PathVariable Long packageId) {
        List<PackagePriceDTO> pricing = eventPackageService.getPackagePricing(packageId);

        return new ResponseEntity<>(
                new StandardResponseDTO(200, "Package pricing retrieved successfully", pricing),
                HttpStatus.OK
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('HOTEL_MANAGER') or hasRole('ADMIN')")
    public ResponseEntity<StandardResponseDTO> deletePackage(@PathVariable Long id) {
        log.info("Deleting event package with ID: {}", id);

        eventPackageService.deletePackage(id);

        return new ResponseEntity<>(
                new StandardResponseDTO(204, "Event package deleted successfully", null),
                HttpStatus.NO_CONTENT
        );
    }
}
