package edu.sliit.service.impl;

import edu.sliit.dto.request.CreateHotelRequestDTO;
import edu.sliit.dto.response.HotelResponseDTO;
import edu.sliit.entity.Hotel;
import edu.sliit.entity.RegistrationStatus;
import edu.sliit.entity.User;
import edu.sliit.exception.InvalidRequestException;
import edu.sliit.exception.ResourceNotFoundException;
import edu.sliit.repository.HotelRepository;
import edu.sliit.service.HotelService;
import edu.sliit.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class HotelServiceImpl implements HotelService {

    private final HotelRepository hotelRepository;
    private final UserService userService;
    private final ModelMapper modelMapper;

    @Override
    public HotelResponseDTO createHotel(CreateHotelRequestDTO request, Long managerId) {
        log.info("Creating hotel: {} managed by user: {}", request.getHotelName(), managerId);

        // Validate required fields
        if (request.getHotelName() == null || request.getHotelName().trim().isEmpty()) {
            throw new InvalidRequestException("Hotel name is required");
        }

        if (request.getAddress() == null || request.getAddress().trim().isEmpty()) {
            throw new InvalidRequestException("Address is required");
        }

        if (request.getCity() == null || request.getCity().trim().isEmpty()) {
            throw new InvalidRequestException("City is required");
        }

        if (request.getContactPhone() == null || request.getContactPhone().trim().isEmpty()) {
            throw new InvalidRequestException("Contact phone is required");
        }

        // Check if hotel name already exists
        if (hotelRepository.existsByHotelName(request.getHotelName())) {
            throw new InvalidRequestException("Hotel with this name already exists");
        }


        User manager = userService.findUserEntityById(managerId);

        // Create hotel with PENDING status
        Hotel hotel = Hotel.builder()
                .hotelName(request.getHotelName())
                .address(request.getAddress())
                .city(request.getCity())
                .description(request.getDescription())
                .contactPhone(request.getContactPhone())
                .image(request.getImage())
                .registrationStatus(RegistrationStatus.PENDING)
                .manager(manager)
                .build();

        Hotel savedHotel = hotelRepository.save(hotel);
        log.info("Hotel created successfully with ID: {} (Status: PENDING)", savedHotel.getId());

        return mapToResponse(savedHotel);
    }

    @Override
    @Transactional(readOnly = true)
    public HotelResponseDTO getHotelById(Long id) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with ID: " + id));

        return mapToResponse(hotel);
    }

    @Override
    @Transactional(readOnly = true)
    public List<HotelResponseDTO> getAllHotels() {
        List<Hotel> hotels = hotelRepository.findAll();
        return hotels.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<HotelResponseDTO> getHotelsByCity(String city) {
        List<Hotel> hotels = hotelRepository.findByCity(city);
        return hotels.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<HotelResponseDTO> getHotelsByManager(Long managerId) {
        User manager = userService.findUserEntityById(managerId);
        List<Hotel> hotels = hotelRepository.findByManager(manager);
        return hotels.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<HotelResponseDTO> getHotelsByStatus(RegistrationStatus status) {
        List<Hotel> hotels = hotelRepository.findByRegistrationStatus(status);
        return hotels.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public HotelResponseDTO updateHotel(Long id, CreateHotelRequestDTO request) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with ID: " + id));

        // Update fields
        if (request.getHotelName() != null && !request.getHotelName().trim().isEmpty()) {
            hotel.setHotelName(request.getHotelName());
        }

        if (request.getAddress() != null && !request.getAddress().trim().isEmpty()) {
            hotel.setAddress(request.getAddress());
        }

        if (request.getCity() != null && !request.getCity().trim().isEmpty()) {
            hotel.setCity(request.getCity());
        }

        if (request.getDescription() != null) {
            hotel.setDescription(request.getDescription());
        }

        if (request.getContactPhone() != null && !request.getContactPhone().trim().isEmpty()) {
            hotel.setContactPhone(request.getContactPhone());
        }

        if (request.getImage() != null) {
            hotel.setImage(request.getImage());
        }

        Hotel updatedHotel = hotelRepository.save(hotel);
        log.info("Hotel updated successfully with ID: {}", updatedHotel.getId());

        return mapToResponse(updatedHotel);
    }

    @Override
    public HotelResponseDTO approveHotel(Long id) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with ID: " + id));

        if (hotel.getRegistrationStatus() != RegistrationStatus.PENDING) {
            throw new InvalidRequestException("Only PENDING hotels can be approved");
        }

        hotel.setRegistrationStatus(RegistrationStatus.APPROVED);
        Hotel approvedHotel = hotelRepository.save(hotel);
        log.info("Hotel approved successfully with ID: {}", approvedHotel.getId());

        return mapToResponse(approvedHotel);
    }

    @Override
    public HotelResponseDTO rejectHotel(Long id) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with ID: " + id));

        if (hotel.getRegistrationStatus() != RegistrationStatus.PENDING) {
            throw new InvalidRequestException("Only PENDING hotels can be rejected");
        }

        hotel.setRegistrationStatus(RegistrationStatus.REJECTED);
        Hotel rejectedHotel = hotelRepository.save(hotel);
        log.info("Hotel rejected successfully with ID: {}", rejectedHotel.getId());

        return mapToResponse(rejectedHotel);
    }

    @Override
    public void deleteHotel(Long id) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with ID: " + id));

        hotelRepository.delete(hotel);
        log.info("Hotel deleted successfully with ID: {}", id);
    }

    private HotelResponseDTO mapToResponse(Hotel hotel) {
        return HotelResponseDTO.builder()
                .id(hotel.getId())
                .hotelName(hotel.getHotelName())
                .address(hotel.getAddress())
                .city(hotel.getCity())
                .description(hotel.getDescription())
                .contactPhone(hotel.getContactPhone())
                .image(hotel.getImage())
                .registrationStatus(hotel.getRegistrationStatus())
                .managerId(hotel.getManager().getId())
                .managerName(hotel.getManager().getName())
                .build();
    }
}
