package kh.eco.istad.platform.order.restapi.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record AddressRequest(
        @NotNull(message = "address id is required")
        UUID id,
        @NotBlank(message = "street is required")
        @Size(max = 255)
        String street,
        @NotBlank(message = "postalCode is required")
        @Size(max = 20)
        String postalCode,
        @NotBlank(message = "city is required")
        @Size(max = 100)
        String city
) {
}
