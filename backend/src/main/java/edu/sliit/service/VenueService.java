package edu.sliit.service;

import edu.sliit.dto.request.CreateVenueRequestDTO;
import edu.sliit.dto.response.VenueResponseDTO;

import java.util.List;

public interface VenueService {

    VenueResponseDTO createVenue(Long hotelId, CreateVenueRequestDTO request);

    VenueResponseDTO getVenueById(Long id);

    List<VenueResponseDTO> getAllVenues();

    List<VenueResponseDTO> getVenuesByHotel(Long hotelId);

    List<VenueResponseDTO> getActiveVenuesByHotel(Long hotelId);

    VenueResponseDTO updateVenue(Long id, CreateVenueRequestDTO request);

    VenueResponseDTO toggleVenueStatus(Long id);

    void deleteVenue(Long id);

    VenueResponseDTO addFacilitiesToVenue(Long venueId, List<Long> facilityIds);

    VenueResponseDTO removeFacilitiesFromVenue(Long venueId, List<Long> facilityIds);
}
