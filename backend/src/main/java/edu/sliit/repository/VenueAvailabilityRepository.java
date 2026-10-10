package edu.sliit.repository;

import edu.sliit.entity.Venue;
import edu.sliit.entity.VenueAvailability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface VenueAvailabilityRepository extends JpaRepository<VenueAvailability, Long> {

    Optional<VenueAvailability> findByVenueAndAvailableDate(Venue venue, LocalDate availableDate);

    List<VenueAvailability> findByVenue(Venue venue);

    @Query("SELECT va FROM VenueAvailability va WHERE va.venue = :venue AND va.availableDate BETWEEN :startDate AND :endDate")
    List<VenueAvailability> findByVenueAndDateRange(@Param("venue") Venue venue, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT va FROM VenueAvailability va WHERE va.venue = :venue AND va.availableDate BETWEEN :startDate AND :endDate AND va.isAvailable = true")
    List<VenueAvailability> findAvailableDates(@Param("venue") Venue venue, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT va FROM VenueAvailability va WHERE va.venue = :venue AND va.availableDate BETWEEN :startDate AND :endDate AND va.isAvailable = false")
    List<VenueAvailability> findBlockedDates(@Param("venue") Venue venue, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
