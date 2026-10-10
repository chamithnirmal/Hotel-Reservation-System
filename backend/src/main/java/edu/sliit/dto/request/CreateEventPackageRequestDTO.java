package edu.sliit.dto.request;

import edu.sliit.entity.EventType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateEventPackageRequestDTO {

    private String packageName;
    private EventType eventType;
    private String description;
    private BigDecimal basePrice;
    private Set<Long> facilityIds;
}
