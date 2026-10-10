package edu.sliit.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateVenueRequestDTO {

    private String venueName;
    private String description;
    private Integer capacity;
    private byte[] image;
    private Set<Long> facilityIds;
}
