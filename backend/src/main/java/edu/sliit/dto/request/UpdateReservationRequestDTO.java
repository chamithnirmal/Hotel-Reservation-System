package edu.sliit.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateReservationRequestDTO {
    private LocalDate eventDate;
    private Integer guestCount;
    private String contactPhone;
    private String specialRequests;
}
