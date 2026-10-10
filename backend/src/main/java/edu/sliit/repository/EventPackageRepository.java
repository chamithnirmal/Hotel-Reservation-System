package edu.sliit.repository;

import edu.sliit.entity.EventPackage;
import edu.sliit.entity.EventType;
import edu.sliit.entity.Venue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EventPackageRepository extends JpaRepository<EventPackage, Long> {

    Optional<EventPackage> findByPackageName(String packageName);

    List<EventPackage> findByVenue(Venue venue);

    List<EventPackage> findByVenueAndIsActive(Venue venue, Boolean isActive);

    List<EventPackage> findByEventType(EventType eventType);

    List<EventPackage> findByVenueAndEventType(Venue venue, EventType eventType);

    boolean existsByPackageName(String packageName);
}
