package edu.sliit.repository;

import edu.sliit.entity.EventPackage;
import edu.sliit.entity.PackagePrice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PackagePriceRepository extends JpaRepository<PackagePrice, Long> {

    List<PackagePrice> findByEventPackage(EventPackage eventPackage);

    Optional<PackagePrice> findByEventPackageAndGuestCount(EventPackage eventPackage, Integer guestCount);

    boolean existsByEventPackageAndGuestCount(EventPackage eventPackage, Integer guestCount);
}
