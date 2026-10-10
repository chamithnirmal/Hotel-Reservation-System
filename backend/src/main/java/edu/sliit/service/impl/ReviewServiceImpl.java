package edu.sliit.service.impl;

import edu.sliit.dto.request.CreateReviewRequestDTO;
import edu.sliit.dto.response.ReviewResponseDTO;
import edu.sliit.entity.Reservation;
import edu.sliit.entity.Review;
import edu.sliit.entity.User;
import edu.sliit.exception.InvalidRequestException;
import edu.sliit.exception.ResourceNotFoundException;
import edu.sliit.exception.UnauthorizedAccessException;
import edu.sliit.repository.ReservationRepository;
import edu.sliit.repository.ReviewRepository;
import edu.sliit.repository.UserRepository;
import edu.sliit.service.ReviewService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final ReservationRepository reservationRepository;

    @Override
    public ReviewResponseDTO createReview(Long customerId, CreateReviewRequestDTO request) {
        log.info("Creating review for customer: {} on reservation: {}", customerId, request.getReservationId());


        validateCreateReviewRequest(request);


        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + customerId));


        Reservation reservation = reservationRepository.findById(request.getReservationId())
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with ID: " + request.getReservationId()));

        // Verify customer is the one who made the reservation
        if (!reservation.getCustomer().getId().equals(customerId)) {
            throw new UnauthorizedAccessException("You can only review your own reservations");
        }

        // Check if customer already reviewed this reservation
        if (reviewRepository.findByReservationIdAndCustomerId(request.getReservationId(), customerId).isPresent()) {
            throw new InvalidRequestException("You have already reviewed this reservation");
        }

        // Create review
        Review review = Review.builder()
                .customer(customer)
                .venue(reservation.getVenue())
                .reservation(reservation)
                .rating(request.getRating())
                .comment(request.getComment())
                .isApproved(true)
                .build();

        Review savedReview = reviewRepository.save(review);
        log.info("Review created successfully with ID: {}", savedReview.getId());

        return mapToResponse(savedReview);
    }

    @Override
    @Transactional(readOnly = true)
    public ReviewResponseDTO getReviewById(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with ID: " + reviewId));

        return mapToResponse(review);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponseDTO> getReviewsByVenue(Long venueId) {
        log.info("Fetching all reviews for venue: {}", venueId);

        List<Review> reviews = reviewRepository.findByVenueId(venueId);

        return reviews.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponseDTO> getReviewsByCustomer(Long customerId) {
        log.info("Fetching all reviews for customer: {}", customerId);


        userRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + customerId));

        List<Review> reviews = reviewRepository.findByCustomerId(customerId);


        for (Review r : reviews) {
            r.getCustomer().getName();
            r.getVenue().getVenueName();
            r.getReservation().getId();
        }

        return reviews.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponseDTO> getReviewsByHotel(Long hotelId) {
        log.info("Fetching all reviews for hotel: {}", hotelId);

        List<Review> reviews = reviewRepository.findByHotelId(hotelId);

        // Initialize lazy-loaded relationships
        for (Review r : reviews) {
            r.getCustomer().getName();
            r.getVenue().getVenueName();
            r.getReservation().getId();
        }

        return reviews.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ReviewResponseDTO updateReview(Long reviewId, CreateReviewRequestDTO request, Long customerId) {
        log.info("Updating review: {} by customer: {}", reviewId, customerId);

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with ID: " + reviewId));

        // Verify customer is the one who wrote the review
        if (!review.getCustomer().getId().equals(customerId)) {
            throw new UnauthorizedAccessException("You can only update your own reviews");
        }

       
        validateUpdateReviewRequest(request);

        // Update review
        review.setRating(request.getRating());
        review.setComment(request.getComment());

        Review updatedReview = reviewRepository.save(review);
        log.info("Review updated successfully with ID: {}", updatedReview.getId());

        return mapToResponse(updatedReview);
    }

    @Override
    public void deleteReview(Long reviewId, Long customerId) {
        log.info("Deleting review: {} by customer: {}", reviewId, customerId);

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with ID: " + reviewId));

        // Verify customer is the one who wrote the review
        if (!review.getCustomer().getId().equals(customerId)) {
            throw new UnauthorizedAccessException("You can only delete your own reviews");
        }

        reviewRepository.delete(review);
        log.info("Review deleted successfully with ID: {}", reviewId);
    }

    private void validateCreateReviewRequest(CreateReviewRequestDTO request) {
        if (request.getReservationId() == null) {
            throw new InvalidRequestException("Reservation ID is required");
        }

        if (request.getRating() == null || request.getRating() < 1 || request.getRating() > 5) {
            throw new InvalidRequestException("Rating must be between 1 and 5 stars");
        }

        if (request.getComment() == null || request.getComment().trim().isEmpty()) {
            throw new InvalidRequestException("Comment is required");
        }

        if (request.getComment().length() > 1000) {
            throw new InvalidRequestException("Comment cannot exceed 1000 characters");
        }
    }

    private void validateUpdateReviewRequest(CreateReviewRequestDTO request) {
        if (request.getRating() == null || request.getRating() < 1 || request.getRating() > 5) {
            throw new InvalidRequestException("Rating must be between 1 and 5 stars");
        }

        if (request.getComment() == null || request.getComment().trim().isEmpty()) {
            throw new InvalidRequestException("Comment is required");
        }

        if (request.getComment().length() > 1000) {
            throw new InvalidRequestException("Comment cannot exceed 1000 characters");
        }
    }

    private ReviewResponseDTO mapToResponse(Review review) {
        return ReviewResponseDTO.builder()
                .id(review.getId())
                .customerId(review.getCustomer().getId())
                .customerName(review.getCustomer().getName())
                .venueId(review.getVenue().getId())
                .venueName(review.getVenue().getVenueName())
                .reservationId(review.getReservation().getId())
                .rating(review.getRating())
                .comment(review.getComment())
                .isApproved(review.getIsApproved())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .build();
    }
}
