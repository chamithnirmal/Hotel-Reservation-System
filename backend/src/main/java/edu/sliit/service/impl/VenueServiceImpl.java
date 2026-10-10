package edu.sliit.service.impl;

import edu.sliit.dto.request.CreateVenueRequestDTO;
import edu.sliit.dto.response.FacilityResponseDTO;
import edu.sliit.dto.response.VenueResponseDTO;
import edu.sliit.entity.EventPackage;
import edu.sliit.entity.Facility;
import edu.sliit.entity.Hotel;
import edu.sliit.entity.Venue;
import edu.sliit.exception.InvalidRequestException;
import edu.sliit.exception.ResourceNotFoundException;
import edu.sliit.repository.EventPackageRepository;
import edu.sliit.repository.FacilityRepository;
import edu.sliit.repository.HotelRepository;
import edu.sliit.repository.VenueRepository;
import edu.sliit.service.VenueService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class VenueServiceImpl implements VenueService {

    private final VenueRepository venueRepository;
    private final HotelRepository hotelRepository;
    private final FacilityRepository facilityRepository;
    private final EventPackageRepository eventPackageRepository;
    private final ModelMapper modelMapper;

    @Override
    public VenueResponseDTO createVenue(Long hotelId, CreateVenueRequestDTO request) {
        log.info("Creating venue: {} for hotel: {}", request.getVenueName(), hotelId);
        //validations
        if (request.getVenueName() == null || request.getVenueName().trim().isEmpty()) {
            throw new InvalidRequestException("Venue name is required");
        }

        if (request.getCapacity() == null || request.getCapacity() <= 0) {
            throw new InvalidRequestException("Capacity must be greater than 0");
        }

        if (venueRepository.existsByVenueName(request.getVenueName())) {
            throw new InvalidRequestException("Venue with this name already exists");
        }

        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with ID: " + hotelId));

        Set<Facility> facilities = new HashSet<>();
        if (request.getFacilityIds() != null && !request.getFacilityIds().isEmpty()) {
            facilities = request.getFacilityIds().stream()
                    .map(id -> facilityRepository.findById(id)
                            .orElseThrow(() -> new ResourceNotFoundException("Facility not found with ID: " + id)))
                    .collect(Collectors.toSet());
        }

        Venue venue = Venue.builder()
                .venueName(request.getVenueName())
                .description(request.getDescription())
                .capacity(request.getCapacity())
                .image(request.getImage())
                .hotel(hotel)
                .facilities(facilities)
                .isActive(true)
                .build();

        Venue savedVenue = venueRepository.save(venue);
        log.info("Venue created successfully with ID: {}", savedVenue.getId());

        return mapToResponse(savedVenue);
    }

    @Override
    @Transactional(readOnly = true)
    public VenueResponseDTO getVenueById(Long id) {
        Venue venue = venueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Venue not found with ID: " + id));

        if (!venue.getIsActive()) {
            throw new ResourceNotFoundException("Venue not found with ID: " + id);
        }

        return mapToResponse(venue);
    }

    @Override
    @Transactional(readOnly = true)
    public List<VenueResponseDTO> getAllVenues() {
        List<Venue> venues = venueRepository.findAllByIsActive(true);
        return venues.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<VenueResponseDTO> getVenuesByHotel(Long hotelId) {
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with ID: " + hotelId));

        List<Venue> venues = venueRepository.findByHotelAndIsActive(hotel, true);
        return venues.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<VenueResponseDTO> getActiveVenuesByHotel(Long hotelId) {
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with ID: " + hotelId));

        List<Venue> venues = venueRepository.findByHotelAndIsActive(hotel, true);
        return venues.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public VenueResponseDTO updateVenue(Long id, CreateVenueRequestDTO request) {
        Venue venue = venueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Venue not found with ID: " + id));

        if (request.getVenueName() != null && !request.getVenueName().trim().isEmpty()) {
            venue.setVenueName(request.getVenueName());
        }

        if (request.getDescription() != null) {
            venue.setDescription(request.getDescription());
        }

        if (request.getCapacity() != null && request.getCapacity() > 0) {
            venue.setCapacity(request.getCapacity());
        }

        if (request.getImage() != null) {
            venue.setImage(request.getImage());
        }

        Venue updatedVenue = venueRepository.save(venue);
        log.info("Venue updated successfully with ID: {}", updatedVenue.getId());

        return mapToResponse(updatedVenue);
    }

    @Override
    public VenueResponseDTO toggleVenueStatus(Long id) {
        Venue venue = venueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Venue not found with ID: " + id));

        venue.setIsActive(!venue.getIsActive());
        Venue updatedVenue = venueRepository.save(venue);

        log.info("Venue status toggled for ID: {} (Active: {})", id, updatedVenue.getIsActive());

        return mapToResponse(updatedVenue);
    }

    @Override
    public void deleteVenue(Long id) {
        Venue venue = venueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Venue not found with ID: " + id));

        // Get all event packages for this venue
        List<EventPackage> packages = eventPackageRepository.findByVenue(venue);

        // Soft delete all associated event packages
        for (EventPackage pkg : packages) {
            pkg.setIsActive(false);
            eventPackageRepository.save(pkg);
        }

        // Soft delete the venue
        venue.setIsActive(false);
        venueRepository.save(venue);

        log.info("Venue soft-deleted with ID: {} — also deactivated {} event packages", id, packages.size());
    }

    @Override
    public VenueResponseDTO addFacilitiesToVenue(Long venueId, List<Long> facilityIds) {
        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new ResourceNotFoundException("Venue not found with ID: " + venueId));

        for (Long facilityId : facilityIds) {
            Facility facility = facilityRepository.findById(facilityId)
                    .orElseThrow(() -> new ResourceNotFoundException("Facility not found with ID: " + facilityId));
            venue.getFacilities().add(facility);
        }

        Venue updatedVenue = venueRepository.save(venue);
        log.info("Facilities added to venue with ID: {}", venueId);

        return mapToResponse(updatedVenue);
    }

    @Override
    public VenueResponseDTO removeFacilitiesFromVenue(Long venueId, List<Long> facilityIds) {
        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new ResourceNotFoundException("Venue not found with ID: " + venueId));

        for (Long facilityId : facilityIds) {
            venue.getFacilities().removeIf(facility -> facility.getId().equals(facilityId));
        }

        Venue updatedVenue = venueRepository.save(venue);
        log.info("Facilities removed from venue with ID: {}", venueId);

        return mapToResponse(updatedVenue);
    }

    private VenueResponseDTO mapToResponse(Venue venue) {
        Set<FacilityResponseDTO> facilityDTOs = venue.getFacilities().stream()
                .map(facility -> modelMapper.map(facility, FacilityResponseDTO.class))
                .collect(Collectors.toSet());

        return VenueResponseDTO.builder()
                .id(venue.getId())
                .venueName(venue.getVenueName())
                .description(venue.getDescription())
                .capacity(venue.getCapacity())
                .image(venue.getImage())
                .hotelId(venue.getHotel().getId())
                .hotelName(venue.getHotel().getHotelName())
                .facilities(facilityDTOs)
                .isActive(venue.getIsActive())
                .build();
    }
}

