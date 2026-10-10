package edu.sliit.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateHotelRequestDTO {

    private String hotelName;
    private String address;
    private String city;
    private String description;
    private String contactPhone;
    private byte[] image;
}
