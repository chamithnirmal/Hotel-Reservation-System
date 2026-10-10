package edu.sliit.controller;

import edu.sliit.dto.request.CreateHotelRequestDTO;
import edu.sliit.dto.response.HotelResponseDTO;
import edu.sliit.entity.RegistrationStatus;
import edu.sliit.security.UserPrincipal;
import edu.sliit.service.HotelService;
import edu.sliit.util.StandardResponseDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/v1/hotels")
@RequiredArgsConstructor
@Slf4j
public class HotelController {

    private final HotelService hotelService;

    @PostMapping
    @PreAuthorize("hasRole('HOTEL_MANAGER')")
    public ResponseEntity<StandardResponseDTO> createHotel(
            @RequestBody CreateHotelRequestDTO request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        log.info("Creating hotel: {}", request.getHotelName());

        HotelResponseDTO hotel = hotelService.createHotel(request, userPrincipal.getUser().getId());

        return new ResponseEntity<>(
                new StandardResponseDTO(201, "Hotel created successfully (Pending admin approval)", hotel),
                HttpStatus.CREATED
        );
    }

    @PostMapping(value = "/with-image", consumes = "multipart/form-data")
    @PreAuthorize("hasRole('HOTEL_MANAGER')")
    public ResponseEntity<StandardResponseDTO> createHotelWithImage(
            @RequestParam("hotelName") String hotelName,
            @RequestParam("address") String address,
            @RequestParam("city") String city,
            @RequestParam("description") String description,
            @RequestParam("contactPhone") String contactPhone,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @AuthenticationPrincipal UserPrincipal userPrincipal) throws IOException {

        log.info("Creating hotel with image: {}", hotelName);

        CreateHotelRequestDTO request = new CreateHotelRequestDTO();
        request.setHotelName(hotelName);
        request.setAddress(address);
        request.setCity(city);
        request.setDescription(description);
        request.setContactPhone(contactPhone);

        if (image != null && !image.isEmpty()) {
            request.setImage(image.getBytes());
        }

        HotelResponseDTO hotel = hotelService.createHotel(request, userPrincipal.getUser().getId());

        return new ResponseEntity<>(
                new StandardResponseDTO(201, "Hotel created successfully (Pending admin approval)", hotel),
                HttpStatus.CREATED
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<StandardResponseDTO> getHotelById(@PathVariable Long id) {
        HotelResponseDTO hotel = hotelService.getHotelById(id);

        return new ResponseEntity<>(
                new StandardResponseDTO(200, "Hotel retrieved successfully", hotel),
                HttpStatus.OK
        );
    }

    @GetMapping("/manager/my-hotel")
    @PreAuthorize("hasRole('HOTEL_MANAGER')")
    public ResponseEntity<StandardResponseDTO> getManagerHotel(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        Long managerId = userPrincipal.getUser().getId();
        log.info("Fetching hotel for manager: {}", managerId);

        List<HotelResponseDTO> hotels = hotelService.getHotelsByManager(managerId);
        
        if (hotels.isEmpty()) {
            return new ResponseEntity<>(
                    new StandardResponseDTO(404, "No hotel found for this manager", null),
                    HttpStatus.NOT_FOUND
            );
        }

        // Return the first hotel (assuming one hotel per manager)
        return new ResponseEntity<>(
                new StandardResponseDTO(200, "Manager's hotel retrieved successfully", hotels.get(0)),
                HttpStatus.OK
        );
    }

    @GetMapping
    public ResponseEntity<StandardResponseDTO> getAllHotels() {
        List<HotelResponseDTO> hotels = hotelService.getAllHotels();

        return new ResponseEntity<>(
                new StandardResponseDTO(200, "All hotels retrieved successfully", hotels),
                HttpStatus.OK
        );
    }

    @GetMapping("/city/{city}")
    public ResponseEntity<StandardResponseDTO> getHotelsByCity(@PathVariable String city) {
        List<HotelResponseDTO> hotels = hotelService.getHotelsByCity(city);

        return new ResponseEntity<>(
                new StandardResponseDTO(200, "Hotels by city retrieved successfully", hotels),
                HttpStatus.OK
        );
    }

    @GetMapping("/manager/{managerId}")
    @PreAuthorize("hasRole('ADMIN') or #managerId == authentication.principal.user.id")
    public ResponseEntity<StandardResponseDTO> getHotelsByManager(@PathVariable Long managerId) {
        List<HotelResponseDTO> hotels = hotelService.getHotelsByManager(managerId);

        return new ResponseEntity<>(
                new StandardResponseDTO(200, "Hotels by manager retrieved successfully", hotels),
                HttpStatus.OK
        );
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StandardResponseDTO> getHotelsByStatus(@PathVariable RegistrationStatus status) {
        List<HotelResponseDTO> hotels = hotelService.getHotelsByStatus(status);

        return new ResponseEntity<>(
                new StandardResponseDTO(200, "Hotels by status retrieved successfully", hotels),
                HttpStatus.OK
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('HOTEL_MANAGER') or hasRole('ADMIN')")
    public ResponseEntity<StandardResponseDTO> updateHotel(
            @PathVariable Long id,
            @RequestBody CreateHotelRequestDTO request) {

        log.info("Updating hotel with ID: {}", id);

        HotelResponseDTO hotel = hotelService.updateHotel(id, request);

        return new ResponseEntity<>(
                new StandardResponseDTO(200, "Hotel updated successfully", hotel),
                HttpStatus.OK
        );
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StandardResponseDTO> approveHotel(@PathVariable Long id) {
        log.info("Approving hotel with ID: {}", id);

        HotelResponseDTO hotel = hotelService.approveHotel(id);

        return new ResponseEntity<>(
                new StandardResponseDTO(200, "Hotel approved successfully", hotel),
                HttpStatus.OK
        );
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StandardResponseDTO> rejectHotel(@PathVariable Long id) {
        log.info("Rejecting hotel with ID: {}", id);

        HotelResponseDTO hotel = hotelService.rejectHotel(id);

        return new ResponseEntity<>(
                new StandardResponseDTO(200, "Hotel rejected successfully", hotel),
                HttpStatus.OK
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('HOTEL_MANAGER') or hasRole('ADMIN')")
    public ResponseEntity<StandardResponseDTO> deleteHotel(@PathVariable Long id) {
        log.info("Deleting hotel with ID: {}", id);

        hotelService.deleteHotel(id);

        return new ResponseEntity<>(
                new StandardResponseDTO(204, "Hotel deleted successfully", null),
                HttpStatus.NO_CONTENT
        );
    }
}
