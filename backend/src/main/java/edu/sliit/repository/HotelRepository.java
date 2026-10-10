package edu.sliit.repository;

import edu.sliit.entity.Hotel;
import edu.sliit.entity.RegistrationStatus;
import edu.sliit.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HotelRepository extends JpaRepository<Hotel, Long> {

    Optional<Hotel> findByHotelName(String hotelName);

    List<Hotel> findByCity(String city);

    List<Hotel> findByManager(User manager);

    List<Hotel> findByRegistrationStatus(RegistrationStatus status);

    boolean existsByHotelName(String hotelName);
}
