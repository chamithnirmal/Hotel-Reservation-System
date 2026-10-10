package edu.sliit.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import edu.sliit.entity.EventType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class EventPackageResponseDTO {

    private Long id;
    private String packageName;
    private EventType eventType;
    private String description;
    private BigDecimal basePrice;
    private Long venueId;
    private String venueName;
    private Set<FacilityResponseDTO> includedFacilities;
    private Set<PackagePriceDTO> pricing;
    private Boolean isActive;
}
