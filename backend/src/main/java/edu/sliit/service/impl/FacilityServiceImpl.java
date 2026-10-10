package edu.sliit.service.impl;

import edu.sliit.dto.request.CreateFacilityRequestDTO;
import edu.sliit.dto.response.FacilityResponseDTO;
import edu.sliit.entity.Facility;
import edu.sliit.exception.InvalidRequestException;
import edu.sliit.exception.ResourceNotFoundException;
import edu.sliit.repository.FacilityRepository;
import edu.sliit.service.FacilityService;
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
public class FacilityServiceImpl implements FacilityService {

    private final FacilityRepository facilityRepository;
    private final ModelMapper modelMapper;

    @Override
    public FacilityResponseDTO createFacility(CreateFacilityRequestDTO request) {
        log.info("Creating facility: {}", request.getFacilityName());

        if (request.getFacilityName() == null || request.getFacilityName().trim().isEmpty()) {
            throw new InvalidRequestException("Facility name is required");
        }

        if (facilityRepository.existsByFacilityName(request.getFacilityName())) {
            throw new InvalidRequestException("Facility with this name already exists");
        }

        Facility facility = Facility.builder()
                .facilityName(request.getFacilityName())
                .description(request.getDescription())
                .build();

        Facility savedFacility = facilityRepository.save(facility);
        log.info("Facility created successfully with ID: {}", savedFacility.getId());

        return modelMapper.map(savedFacility, FacilityResponseDTO.class);
    }

    @Override
    @Transactional(readOnly = true)
    public FacilityResponseDTO getFacilityById(Long id) {
        Facility facility = facilityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Facility not found with ID: " + id));

        return modelMapper.map(facility, FacilityResponseDTO.class);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FacilityResponseDTO> getAllFacilities() {
        List<Facility> facilities = facilityRepository.findAll();
        return facilities.stream()
                .map(facility -> modelMapper.map(facility, FacilityResponseDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public FacilityResponseDTO updateFacility(Long id, CreateFacilityRequestDTO request) {
        Facility facility = facilityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Facility not found with ID: " + id));

        if (request.getFacilityName() != null && !request.getFacilityName().trim().isEmpty()) {
            facility.setFacilityName(request.getFacilityName());
        }

        if (request.getDescription() != null) {
            facility.setDescription(request.getDescription());
        }

        Facility updatedFacility = facilityRepository.save(facility);
        log.info("Facility updated successfully with ID: {}", updatedFacility.getId());

        return modelMapper.map(updatedFacility, FacilityResponseDTO.class);
    }

    @Override
    public void deleteFacility(Long id) {
        Facility facility = facilityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Facility not found with ID: " + id));

        facilityRepository.delete(facility);
        log.info("Facility deleted successfully with ID: {}", id);
    }
}
