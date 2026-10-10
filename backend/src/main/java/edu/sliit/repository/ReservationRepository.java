package edu.sliit.repository;

import edu.sliit.entity.Reservation;
import edu.sliit.entity.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    
    List<Reservation> findByCustomerId(Long customerId);
    
    List<Reservation> findByCustomerIdAndStatus(Long customerId, ReservationStatus status);
    
    List<Reservation> findByVenueId(Long venueId);
    
    List<Reservation> findByVenueIdAndEventDate(Long venueId, LocalDate eventDate);
    
    @Query("SELECT r FROM Reservation r WHERE r.venue.id = :venueId AND r.eventDate = :eventDate AND r.status IN ('APPROVED', 'PENDING')")
    List<Reservation> findActiveReservationsByVenueAndDate(@Param("venueId") Long venueId, @Param("eventDate") LocalDate eventDate);
    
    @Query("SELECT r FROM Reservation r " +
           "JOIN FETCH r.customer " +
           "JOIN FETCH r.venue " +
           "JOIN FETCH r.eventPackage " +
           "WHERE r.customer.id = :customerId " +
           "ORDER BY r.createdAt DESC")
    List<Reservation> findReservationsByCustomerOrderByCreatedAtDesc(@Param("customerId") Long customerId);
    
    @Query("SELECT r FROM Reservation r " +
           "JOIN FETCH r.customer " +
           "JOIN FETCH r.venue " +
           "JOIN FETCH r.eventPackage " +
           "WHERE r.venue.id = :venueId AND r.status = :status " +
           "ORDER BY r.createdAt DESC")
    List<Reservation> findByVenueAndStatusOrderByCreatedAtDesc(@Param("venueId") Long venueId, @Param("status") ReservationStatus status);
    
    @Query("SELECT r FROM Reservation r " +
           "JOIN FETCH r.customer " +
           "JOIN FETCH r.venue " +
           "JOIN FETCH r.eventPackage " +
           "WHERE r.venue.id = :venueId AND r.status = 'PENDING' " +
           "ORDER BY r.createdAt ASC")
    List<Reservation> findPendingReservationsByVenue(@Param("venueId") Long venueId);
    
    @Query("SELECT r FROM Reservation r WHERE r.status = 'PENDING' AND r.venue.hotel.id = :hotelId ORDER BY r.createdAt ASC")
    List<Reservation> findPendingReservationsByHotel(@Param("hotelId") Long hotelId);
    
    @Query("SELECT r FROM Reservation r WHERE r.venue.hotel.id = :hotelId ORDER BY r.createdAt DESC")
    List<Reservation> findAllReservationsByHotel(@Param("hotelId") Long hotelId);
    
    @Query("SELECT r FROM Reservation r WHERE r.status = :status ORDER BY r.createdAt DESC")
    List<Reservation> findByStatusOrderByCreatedAtDesc(@Param("status") ReservationStatus status);
    
    List<Reservation> findByStatus(ReservationStatus status);
}
