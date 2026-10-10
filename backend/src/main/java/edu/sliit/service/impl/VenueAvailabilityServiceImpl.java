package edu.sliit.service.impl;

import edu.sliit.dto.response.VenueAvailabilityDTO;
import edu.sliit.entity.Venue;
import edu.sliit.entity.VenueAvailability;
import edu.sliit.exception.InvalidRequestException;
import edu.sliit.exception.ResourceNotFoundException;
import edu.sliit.repository.VenueAvailabilityRepository;
import edu.sliit.repository.VenueRepository;
import edu.sliit.service.VenueAvailabilityService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class VenueAvailabilityServiceImpl implements VenueAvailabilityService {

    private final VenueAvailabilityRepository venueAvailabilityRepository;
    private final VenueRepository venueRepository;
    private final ModelMapper modelMapper;

    @Override
    @Transactional(readOnly = true)
    public boolean isVenueAvailable(Long venueId, LocalDate date) {
        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new ResourceNotFoundException("Venue not found with ID: " + venueId));

        if (date == null || date.isBefore(LocalDate.now())) {
            throw new InvalidRequestException("Date must be today or in the future");
        }

        Optional<VenueAvailability> availability = venueAvailabilityRepository.findByVenueAndAvailableDate(venue, date);

        if (availability.isEmpty()) {
            return true;
        }

        return availability.get().getIsAvailable();
    }

    @Override
    public void bookVenueDate(Long venueId, LocalDate date) {
        log.info("Booking venue: {} for date: {}", venueId, date);

        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new ResourceNotFoundException("Venue not found with ID: " + venueId));

        if (date == null || date.isBefore(LocalDate.now())) {
            throw new InvalidRequestException("Date must be today or in the future");
        }

        Optional<VenueAvailability> existingAvailability = venueAvailabilityRepository.findByVenueAndAvailableDate(venue, date);

        if (existingAvailability.isPresent()) {
            VenueAvailability availability = existingAvailability.get();
            availability.setIsAvailable(false);
            venueAvailabilityRepository.save(availability);
        } else {
            VenueAvailability availability = VenueAvailability.builder()
                    .venue(venue)
                    .availableDate(date)
                    .isAvailable(false)
                    .build();
            venueAvailabilityRepository.save(availability);
        }

        log.info("Venue booked successfully for date: {}", date);
    }

    @Override
    public void cancelVenueDate(Long venueId, LocalDate date) {
        log.info("Cancelling venue booking: {} for date: {}", venueId, date);

        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new ResourceNotFoundException("Venue not found with ID: " + venueId));

        if (date == null) {
            throw new InvalidRequestException("Date is required");
        }

        Optional<VenueAvailability> existingAvailability = venueAvailabilityRepository.findByVenueAndAvailableDate(venue, date);

        if (existingAvailability.isPresent()) {
            VenueAvailability availability = existingAvailability.get();
            availability.setIsAvailable(true);
            venueAvailabilityRepository.save(availability);
            log.info("Venue booking cancelled successfully for date: {}", date);
        } else {
            log.warn("No availability record found for venue: {} and date: {}", venueId, date);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<VenueAvailabilityDTO> getAvailableDates(Long venueId, LocalDate startDate, LocalDate endDate) {
        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new ResourceNotFoundException("Venue not found with ID: " + venueId));

        if (startDate == null || endDate == null) {
            throw new InvalidRequestException("Start date and end date are required");
        }

        if (startDate.isAfter(endDate)) {
            throw new InvalidRequestException("Start date must be before end date");
        }

        List<VenueAvailability> availableDates = venueAvailabilityRepository.findAvailableDates(venue, startDate, endDate);

        return availableDates.stream()
                .map(availability -> modelMapper.map(availability, VenueAvailabilityDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<VenueAvailabilityDTO> getBookedDates(Long venueId, LocalDate startDate, LocalDate endDate) {
        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new ResourceNotFoundException("Venue not found with ID: " + venueId));

        if (startDate == null || endDate == null) {
            throw new InvalidRequestException("Start date and end date are required");
        }

        if (startDate.isAfter(endDate)) {
            throw new InvalidRequestException("Start date must be before end date");
        }

        List<VenueAvailability> bookedDates = venueAvailabilityRepository.findBlockedDates(venue, startDate, endDate);

        return bookedDates.stream()
                .map(availability -> modelMapper.map(availability, VenueAvailabilityDTO.class))
                .collect(Collectors.toList());
    }
}
