package edu.sliit.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class VenueResponseDTO {

    private Long id;
    private String venueName;
    private String description;
    private Integer capacity;
    private byte[] image;
    private Long hotelId;
    private String hotelName;
    private Set<FacilityResponseDTO> facilities;
    private Boolean isActive;
}
