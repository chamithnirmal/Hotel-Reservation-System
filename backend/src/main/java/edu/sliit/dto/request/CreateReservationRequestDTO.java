package edu.sliit.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateReservationRequestDTO {
    private Long venueId;
    private Long eventPackageId;
    private LocalDate eventDate;
    private Integer guestCount;
    private String contactPhone;
}
