package edu.sliit.service.impl;

import edu.sliit.dto.request.CreateEventPackageRequestDTO;
import edu.sliit.dto.response.EventPackageResponseDTO;
import edu.sliit.dto.response.FacilityResponseDTO;
import edu.sliit.dto.response.PackagePriceDTO;
import edu.sliit.entity.EventPackage;
import edu.sliit.entity.EventType;
import edu.sliit.entity.Facility;
import edu.sliit.entity.PackagePrice;
import edu.sliit.entity.Venue;
import edu.sliit.exception.InvalidRequestException;
import edu.sliit.exception.ResourceNotFoundException;
import edu.sliit.repository.EventPackageRepository;
import edu.sliit.repository.FacilityRepository;
import edu.sliit.repository.PackagePriceRepository;
import edu.sliit.repository.VenueRepository;
import edu.sliit.service.EventPackageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class EventPackageServiceImpl implements EventPackageService {

    private final EventPackageRepository eventPackageRepository;
    private final PackagePriceRepository packagePriceRepository;
    private final VenueRepository venueRepository;
    private final FacilityRepository facilityRepository;
    private final ModelMapper modelMapper;

    @Override
    public EventPackageResponseDTO createPackage(Long venueId, CreateEventPackageRequestDTO request) {
        log.info("Creating event package: {} for venue: {}", request.getPackageName(), venueId);

        if (request.getPackageName() == null || request.getPackageName().trim().isEmpty()) {
            throw new InvalidRequestException("Package name is required");
        }

        if (request.getEventType() == null) {
            throw new InvalidRequestException("Event type is required");
        }

        if (request.getBasePrice() == null || request.getBasePrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidRequestException("Base price must be greater than 0");
        }

        if (eventPackageRepository.existsByPackageName(request.getPackageName())) {
            throw new InvalidRequestException("Package with this name already exists");
        }

        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new ResourceNotFoundException("Venue not found with ID: " + venueId));

        Set<Facility> facilities = new HashSet<>();
        if (request.getFacilityIds() != null && !request.getFacilityIds().isEmpty()) {
            facilities = request.getFacilityIds().stream()
                    .map(id -> facilityRepository.findById(id)
                            .orElseThrow(() -> new ResourceNotFoundException("Facility not found with ID: " + id)))
                    .collect(Collectors.toSet());
        }

        EventPackage eventPackage = EventPackage.builder()
                .packageName(request.getPackageName())
                .eventType(request.getEventType())
                .description(request.getDescription())
                .basePrice(request.getBasePrice())
                .venue(venue)
                .includedFacilities(facilities)
                .isActive(true)
                .build();

        EventPackage savedPackage = eventPackageRepository.save(eventPackage);
        log.info("Event package created successfully with ID: {}", savedPackage.getId());

        return mapToResponse(savedPackage);
    }

    @Override
    @Transactional(readOnly = true)
    public EventPackageResponseDTO getPackageById(Long id) {
        EventPackage eventPackage = eventPackageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event package not found with ID: " + id));

        return mapToResponse(eventPackage);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EventPackageResponseDTO> getAllPackages() {
        log.info(" Service: Fetching all packages from repository");
        
        List<EventPackage> packages = eventPackageRepository.findAll();
        log.info("Service: Found {} packages in database", packages.size());
        
        List<EventPackageResponseDTO> result = packages.stream()
                .map(pkg -> {
                    log.info(" Service: Converting package - id={}, name={}, venue={}", pkg.getId(), pkg.getPackageName(), pkg.getVenue().getId());
                    return mapToResponse(pkg);
                })
                .collect(Collectors.toList());
        
        log.info(" Service: Returning {} DTOs", result.size());
        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public List<EventPackageResponseDTO> getPackagesByVenue(Long venueId) {
        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new ResourceNotFoundException("Venue not found with ID: " + venueId));

        List<EventPackage> packages = eventPackageRepository.findByVenue(venue);
        return packages.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<EventPackageResponseDTO> getPackagesByEventType(EventType eventType) {
        List<EventPackage> packages = eventPackageRepository.findByEventType(eventType);
        return packages.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public EventPackageResponseDTO updatePackage(Long id, CreateEventPackageRequestDTO request) {
        EventPackage eventPackage = eventPackageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event package not found with ID: " + id));

        if (request.getPackageName() != null && !request.getPackageName().trim().isEmpty()) {
            eventPackage.setPackageName(request.getPackageName());
        }

        if (request.getEventType() != null) {
            eventPackage.setEventType(request.getEventType());
        }

        if (request.getDescription() != null) {
            eventPackage.setDescription(request.getDescription());
        }

        if (request.getBasePrice() != null && request.getBasePrice().compareTo(BigDecimal.ZERO) > 0) {
            eventPackage.setBasePrice(request.getBasePrice());
        }

        EventPackage updatedPackage = eventPackageRepository.save(eventPackage);
        log.info("Event package updated successfully with ID: {}", updatedPackage.getId());

        return mapToResponse(updatedPackage);
    }

    @Override
    public EventPackageResponseDTO togglePackageStatus(Long id) {
        EventPackage eventPackage = eventPackageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event package not found with ID: " + id));

        eventPackage.setIsActive(!eventPackage.getIsActive());
        EventPackage updatedPackage = eventPackageRepository.save(eventPackage);

        log.info("Package status toggled for ID: {} (Active: {})", id, updatedPackage.getIsActive());

        return mapToResponse(updatedPackage);
    }

    @Override
    public EventPackageResponseDTO addFacilitiesToPackage(Long packageId, List<Long> facilityIds) {
        EventPackage eventPackage = eventPackageRepository.findById(packageId)
                .orElseThrow(() -> new ResourceNotFoundException("Event package not found with ID: " + packageId));

        for (Long facilityId : facilityIds) {
            Facility facility = facilityRepository.findById(facilityId)
                    .orElseThrow(() -> new ResourceNotFoundException("Facility not found with ID: " + facilityId));
            eventPackage.getIncludedFacilities().add(facility);
        }

        EventPackage updatedPackage = eventPackageRepository.save(eventPackage);
        log.info("Facilities added to package with ID: {}", packageId);

        return mapToResponse(updatedPackage);
    }

    @Override
    public EventPackageResponseDTO removeFacilitiesFromPackage(Long packageId, List<Long> facilityIds) {
        EventPackage eventPackage = eventPackageRepository.findById(packageId)
                .orElseThrow(() -> new ResourceNotFoundException("Event package not found with ID: " + packageId));

        for (Long facilityId : facilityIds) {
            eventPackage.getIncludedFacilities().removeIf(facility -> facility.getId().equals(facilityId));
        }

        EventPackage updatedPackage = eventPackageRepository.save(eventPackage);
        log.info("Facilities removed from package with ID: {}", packageId);

        return mapToResponse(updatedPackage);
    }

    @Override
    public void deletePackage(Long id) {
        EventPackage eventPackage = eventPackageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event package not found with ID: " + id));

        eventPackageRepository.delete(eventPackage);
        log.info("Event package deleted successfully with ID: {}", id);
    }

    @Override
    public PackagePriceDTO addPackagePrice(Long packageId, Integer guestCount, BigDecimal totalPrice) {
        EventPackage eventPackage = eventPackageRepository.findById(packageId)
                .orElseThrow(() -> new ResourceNotFoundException("Event package not found with ID: " + packageId));

        if (guestCount == null || guestCount <= 0) {
            throw new InvalidRequestException("Guest count must be greater than 0");
        }

        if (totalPrice == null || totalPrice.compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidRequestException("Total price must be greater than 0");
        }

        if (packagePriceRepository.existsByEventPackageAndGuestCount(eventPackage, guestCount)) {
            throw new InvalidRequestException("Price already exists for this guest count");
        }

        PackagePrice packagePrice = PackagePrice.builder()
                .eventPackage(eventPackage)
                .guestCount(guestCount)
                .totalPrice(totalPrice)
                .build();

        PackagePrice savedPrice = packagePriceRepository.save(packagePrice);
        log.info("Package price added for package ID: {} with guest count: {}", packageId, guestCount);

        return modelMapper.map(savedPrice, PackagePriceDTO.class);
    }

    @Override
    public PackagePriceDTO updatePackagePrice(Long priceId, Integer guestCount, BigDecimal totalPrice) {
        PackagePrice packagePrice = packagePriceRepository.findById(priceId)
                .orElseThrow(() -> new ResourceNotFoundException("Package price not found with ID: " + priceId));

        if (guestCount != null && guestCount > 0) {
            packagePrice.setGuestCount(guestCount);
        }

        if (totalPrice != null && totalPrice.compareTo(BigDecimal.ZERO) > 0) {
            packagePrice.setTotalPrice(totalPrice);
        }

        PackagePrice updatedPrice = packagePriceRepository.save(packagePrice);
        log.info("Package price updated for ID: {}", priceId);

        return modelMapper.map(updatedPrice, PackagePriceDTO.class);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PackagePriceDTO> getPackagePricing(Long packageId) {
        EventPackage eventPackage = eventPackageRepository.findById(packageId)
                .orElseThrow(() -> new ResourceNotFoundException("Event package not found with ID: " + packageId));

        List<PackagePrice> prices = packagePriceRepository.findByEventPackage(eventPackage);
        return prices.stream()
                .map(price -> modelMapper.map(price, PackagePriceDTO.class))
                .collect(Collectors.toList());
    }

    private EventPackageResponseDTO mapToResponse(EventPackage eventPackage) {
        Set<FacilityResponseDTO> facilityDTOs = eventPackage.getIncludedFacilities().stream()
                .map(facility -> modelMapper.map(facility, FacilityResponseDTO.class))
                .collect(Collectors.toSet());

        List<PackagePrice> prices = packagePriceRepository.findByEventPackage(eventPackage);
        Set<PackagePriceDTO> pricingDTOs = prices.stream()
                .map(price -> modelMapper.map(price, PackagePriceDTO.class))
                .collect(Collectors.toSet());

        return EventPackageResponseDTO.builder()
                .id(eventPackage.getId())
                .packageName(eventPackage.getPackageName())
                .eventType(eventPackage.getEventType())
                .description(eventPackage.getDescription())
                .basePrice(eventPackage.getBasePrice())
                .venueId(eventPackage.getVenue().getId())
                .venueName(eventPackage.getVenue().getVenueName())
                .includedFacilities(facilityDTOs)
                .pricing(pricingDTOs)
                .isActive(eventPackage.getIsActive())
                .build();
    }
}
