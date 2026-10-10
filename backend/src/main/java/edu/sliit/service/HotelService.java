package edu.sliit.service;

import edu.sliit.dto.request.CreateHotelRequestDTO;
import edu.sliit.dto.response.HotelResponseDTO;
import edu.sliit.entity.RegistrationStatus;

import java.util.List;

public interface HotelService {

    HotelResponseDTO createHotel(CreateHotelRequestDTO request, Long managerId);

    HotelResponseDTO getHotelById(Long id);

    List<HotelResponseDTO> getAllHotels();

    List<HotelResponseDTO> getHotelsByCity(String city);

    List<HotelResponseDTO> getHotelsByManager(Long managerId);

    List<HotelResponseDTO> getHotelsByStatus(RegistrationStatus status);

    HotelResponseDTO updateHotel(Long id, CreateHotelRequestDTO request);

    HotelResponseDTO approveHotel(Long id);

    HotelResponseDTO rejectHotel(Long id);

    void deleteHotel(Long id);
}
