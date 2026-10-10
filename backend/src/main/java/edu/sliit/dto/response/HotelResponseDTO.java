package edu.sliit.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import edu.sliit.entity.RegistrationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class HotelResponseDTO {

    private Long id;
    private String hotelName;
    private String address;
    private String city;
    private String description;
    private String contactPhone;
    private byte[] image;
    private RegistrationStatus registrationStatus;
    private Long managerId;
    private String managerName;
}
