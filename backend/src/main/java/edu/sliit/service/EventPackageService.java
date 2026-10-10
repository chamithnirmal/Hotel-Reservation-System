package edu.sliit.service;

import edu.sliit.dto.request.CreateEventPackageRequestDTO;
import edu.sliit.dto.response.EventPackageResponseDTO;
import edu.sliit.dto.response.PackagePriceDTO;
import edu.sliit.entity.EventType;

import java.math.BigDecimal;
import java.util.List;

public interface EventPackageService {

    EventPackageResponseDTO createPackage(Long venueId, CreateEventPackageRequestDTO request);

    EventPackageResponseDTO getPackageById(Long id);

    List<EventPackageResponseDTO> getAllPackages();

    List<EventPackageResponseDTO> getPackagesByVenue(Long venueId);

    List<EventPackageResponseDTO> getPackagesByEventType(EventType eventType);

    EventPackageResponseDTO updatePackage(Long id, CreateEventPackageRequestDTO request);

    EventPackageResponseDTO togglePackageStatus(Long id);

    EventPackageResponseDTO addFacilitiesToPackage(Long packageId, List<Long> facilityIds);

    EventPackageResponseDTO removeFacilitiesFromPackage(Long packageId, List<Long> facilityIds);

    void deletePackage(Long id);

    PackagePriceDTO addPackagePrice(Long packageId, Integer guestCount, BigDecimal totalPrice);

    PackagePriceDTO updatePackagePrice(Long priceId, Integer guestCount, BigDecimal totalPrice);

    List<PackagePriceDTO> getPackagePricing(Long packageId);
}
