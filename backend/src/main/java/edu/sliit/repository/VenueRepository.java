package edu.sliit.repository;

import edu.sliit.entity.Hotel;
import edu.sliit.entity.Venue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VenueRepository extends JpaRepository<Venue, Long> {

    Optional<Venue> findByVenueName(String venueName);

    List<Venue> findByHotel(Hotel hotel);

    List<Venue> findByHotelAndIsActive(Hotel hotel, Boolean isActive);

    List<Venue> findAllByIsActive(Boolean isActive);

    boolean existsByVenueName(String venueName);
}
