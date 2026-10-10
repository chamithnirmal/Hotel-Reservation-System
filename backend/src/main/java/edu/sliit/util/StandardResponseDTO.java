package edu.sliit.util;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StandardResponseDTO {
    
    private int code;
    private String message;
    private Object data;
}