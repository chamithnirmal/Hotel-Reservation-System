package edu.sliit.controller;

import edu.sliit.dto.request.CreateFacilityRequestDTO;
import edu.sliit.dto.response.FacilityResponseDTO;
import edu.sliit.service.FacilityService;
import edu.sliit.util.StandardResponseDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/facilities")
@RequiredArgsConstructor
@Slf4j
public class FacilityController {

    private final FacilityService facilityService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('HOTEL_MANAGER')")
    public ResponseEntity<StandardResponseDTO> createFacility(@RequestBody CreateFacilityRequestDTO request) {
        log.info("Creating facility: {}", request.getFacilityName());

        FacilityResponseDTO facility = facilityService.createFacility(request);

        return new ResponseEntity<>(
                new StandardResponseDTO(201, "Facility created successfully", facility),
                HttpStatus.CREATED
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<StandardResponseDTO> getFacilityById(@PathVariable Long id) {
        FacilityResponseDTO facility = facilityService.getFacilityById(id);

        return new ResponseEntity<>(
                new StandardResponseDTO(200, "Facility retrieved successfully", facility),
                HttpStatus.OK
        );
    }

    @GetMapping
    public ResponseEntity<StandardResponseDTO> getAllFacilities() {
        List<FacilityResponseDTO> facilities = facilityService.getAllFacilities();

        return new ResponseEntity<>(
                new StandardResponseDTO(200, "All facilities retrieved successfully", facilities),
                HttpStatus.OK
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StandardResponseDTO> updateFacility(
            @PathVariable Long id,
            @RequestBody CreateFacilityRequestDTO request) {

        log.info("Updating facility with ID: {}", id);

        FacilityResponseDTO facility = facilityService.updateFacility(id, request);

        return new ResponseEntity<>(
                new StandardResponseDTO(200, "Facility updated successfully", facility),
                HttpStatus.OK
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StandardResponseDTO> deleteFacility(@PathVariable Long id) {
        log.info("Deleting facility with ID: {}", id);

        facilityService.deleteFacility(id);

        return new ResponseEntity<>(
                new StandardResponseDTO(204, "Facility deleted successfully", null),
                HttpStatus.NO_CONTENT
        );
    }
}
