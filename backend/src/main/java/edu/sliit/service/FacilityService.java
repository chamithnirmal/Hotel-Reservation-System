package edu.sliit.service;

import edu.sliit.dto.request.CreateFacilityRequestDTO;
import edu.sliit.dto.response.FacilityResponseDTO;

import java.util.List;

public interface FacilityService {

    FacilityResponseDTO createFacility(CreateFacilityRequestDTO request);

    FacilityResponseDTO getFacilityById(Long id);

    List<FacilityResponseDTO> getAllFacilities();

    FacilityResponseDTO updateFacility(Long id, CreateFacilityRequestDTO request);

    void deleteFacility(Long id);
}
