package edu.sliit.service;

import edu.sliit.dto.response.VenueAvailabilityDTO;

import java.time.LocalDate;
import java.util.List;

public interface VenueAvailabilityService {

    boolean isVenueAvailable(Long venueId, LocalDate date);

    void bookVenueDate(Long venueId, LocalDate date);

    void cancelVenueDate(Long venueId, LocalDate date);

    List<VenueAvailabilityDTO> getAvailableDates(Long venueId, LocalDate startDate, LocalDate endDate);

    List<VenueAvailabilityDTO> getBookedDates(Long venueId, LocalDate startDate, LocalDate endDate);
}
