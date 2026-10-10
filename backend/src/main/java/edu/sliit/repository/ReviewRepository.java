package edu.sliit.repository;

import edu.sliit.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    
    List<Review> findByVenueId(Long venueId);
    
    List<Review> findByCustomerId(Long customerId);
    
    List<Review> findByReservationId(Long reservationId);
    
    Optional<Review> findByReservationIdAndCustomerId(Long reservationId, Long customerId);
    
    List<Review> findByVenueIdAndIsApprovedTrue(Long venueId);
    
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.venue.id = :venueId AND r.isApproved = true")
    Double getAverageRatingByVenue(@Param("venueId") Long venueId);
    
    @Query("SELECT COUNT(r) FROM Review r WHERE r.venue.id = :venueId AND r.isApproved = true")
    Long getReviewCountByVenue(@Param("venueId") Long venueId);
    
    @Query("SELECT r FROM Review r WHERE r.venue.id = :venueId AND r.isApproved = true ORDER BY r.createdAt DESC")
    List<Review> findApprovedReviewsByVenueOrderByCreatedAtDesc(@Param("venueId") Long venueId);
    
    @Query("SELECT r FROM Review r WHERE r.customer.id = :customerId ORDER BY r.createdAt DESC")
    List<Review> findByCustomerOrderByCreatedAtDesc(@Param("customerId") Long customerId);
    
    @Query("SELECT r FROM Review r WHERE r.venue.hotel.id = :hotelId ORDER BY r.createdAt DESC")
    List<Review> findByHotelId(@Param("hotelId") Long hotelId);
}
