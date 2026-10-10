package edu.sliit.service;

import edu.sliit.dto.request.CreateReviewRequestDTO;
import edu.sliit.dto.response.ReviewResponseDTO;

import java.util.List;

public interface ReviewService {
    
    ReviewResponseDTO createReview(Long customerId, CreateReviewRequestDTO request);
    
    ReviewResponseDTO getReviewById(Long reviewId);
    
    List<ReviewResponseDTO> getReviewsByVenue(Long venueId);
    
    List<ReviewResponseDTO> getReviewsByCustomer(Long customerId);
    
    List<ReviewResponseDTO> getReviewsByHotel(Long hotelId);
    
    ReviewResponseDTO updateReview(Long reviewId, CreateReviewRequestDTO request, Long customerId);
    
    void deleteReview(Long reviewId, Long customerId);
}
