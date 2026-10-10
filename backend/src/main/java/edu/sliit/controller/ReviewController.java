package edu.sliit.controller;

import edu.sliit.dto.request.CreateReviewRequestDTO;
import edu.sliit.dto.response.ReviewResponseDTO;
import edu.sliit.security.UserPrincipal;
import edu.sliit.service.ReviewService;
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
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
@Slf4j
public class ReviewController {

    private final ReviewService reviewService;

    // ===== CUSTOMER ENDPOINTS =====

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<StandardResponseDTO> createReview(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody CreateReviewRequestDTO request) {

        Long customerId = userPrincipal.getUser().getId();
        log.info("Creating review for customer: {}", customerId);

        ReviewResponseDTO review = reviewService.createReview(customerId, request);

        return new ResponseEntity<>(
                new StandardResponseDTO(201, "Review created successfully", review),
                HttpStatus.CREATED
        );
    }

    @GetMapping("/customer/my-reviews")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<StandardResponseDTO> getMyReviews(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        Long customerId = userPrincipal.getUser().getId();
        log.info("Fetching reviews for customer: {}", customerId);

        List<ReviewResponseDTO> reviews = reviewService.getReviewsByCustomer(customerId);

        return new ResponseEntity<>(
                new StandardResponseDTO(200, "Reviews retrieved successfully", reviews),
                HttpStatus.OK
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<StandardResponseDTO> updateReview(
            @PathVariable Long id,
            @RequestBody CreateReviewRequestDTO request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        Long customerId = userPrincipal.getUser().getId();
        log.info("Updating review: {} by customer: {}", id, customerId);

        ReviewResponseDTO review = reviewService.updateReview(id, request, customerId);

        return new ResponseEntity<>(
                new StandardResponseDTO(200, "Review updated successfully", review),
                HttpStatus.OK
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<StandardResponseDTO> deleteReview(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        Long customerId = userPrincipal.getUser().getId();
        log.info("Deleting review: {} by customer: {}", id, customerId);

        reviewService.deleteReview(id, customerId);

        return new ResponseEntity<>(
                new StandardResponseDTO(204, "Review deleted successfully", null),
                HttpStatus.NO_CONTENT
        );
    }

    // ===== PUBLIC ENDPOINTS =====

    @GetMapping("/{id}")
    public ResponseEntity<StandardResponseDTO> getReviewById(@PathVariable Long id) {
        log.info("Fetching review: {}", id);

        ReviewResponseDTO review = reviewService.getReviewById(id);

        return new ResponseEntity<>(
                new StandardResponseDTO(200, "Review retrieved successfully", review),
                HttpStatus.OK
        );
    }

    @GetMapping("/venue/{venueId}")
    public ResponseEntity<StandardResponseDTO> getReviewsByVenue(@PathVariable Long venueId) {
        log.info("Fetching all reviews for venue: {}", venueId);

        List<ReviewResponseDTO> reviews = reviewService.getReviewsByVenue(venueId);

        return new ResponseEntity<>(
                new StandardResponseDTO(200, "Reviews retrieved successfully", reviews),
                HttpStatus.OK
        );
    }

    @GetMapping("/hotel/{hotelId}")
    public ResponseEntity<StandardResponseDTO> getReviewsByHotel(@PathVariable Long hotelId) {
        log.info("Fetching all reviews for hotel: {}", hotelId);

        List<ReviewResponseDTO> reviews = reviewService.getReviewsByHotel(hotelId);

        return new ResponseEntity<>(
                new StandardResponseDTO(200, "Reviews retrieved successfully", reviews),
                HttpStatus.OK
        );
    }

}
