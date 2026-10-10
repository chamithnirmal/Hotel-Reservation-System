package edu.sliit.repository;

import edu.sliit.entity.Facility;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FacilityRepository extends JpaRepository<Facility, Long> {

    Optional<Facility> findByFacilityName(String facilityName);

    boolean existsByFacilityName(String facilityName);
}
