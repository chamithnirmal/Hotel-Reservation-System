package edu.sliit.service;

import edu.sliit.dto.request.CreateReservationRequestDTO;
import edu.sliit.dto.request.UpdateReservationRequestDTO;
import edu.sliit.dto.response.ReservationResponseDTO;

import java.util.List;

public interface ReservationService {
    
    ReservationResponseDTO createReservation(Long customerId, CreateReservationRequestDTO request);
    
    ReservationResponseDTO getReservationById(Long reservationId);
    
    List<ReservationResponseDTO> getReservationsByCustomer(Long customerId);
    
    List<ReservationResponseDTO> getReservationsByCustomerAndStatus(Long customerId, String status);
    
    ReservationResponseDTO updateReservation(Long reservationId, UpdateReservationRequestDTO request);
    
    ReservationResponseDTO cancelReservation(Long reservationId);
    
    // Approval workflow methods
    ReservationResponseDTO approveReservation(Long reservationId, Long hotelManagerId);
    
    ReservationResponseDTO rejectReservation(Long reservationId, Long hotelManagerId, String rejectionReason);
    
    ReservationResponseDTO completeReservation(Long reservationId);
    
    List<ReservationResponseDTO> getPendingReservationsByHotel(Long hotelId);
    
    List<ReservationResponseDTO> getAllReservationsByHotel(Long hotelId);
    
    List<ReservationResponseDTO> getPendingReservationsByVenue(Long venueId);
    
    List<ReservationResponseDTO> getReservationsByVenueAndStatus(Long venueId, String status);
    
    // Admin methods
    List<ReservationResponseDTO> getAllReservations();
    
    List<ReservationResponseDTO> getAllReservationsByStatus(String status);
}
