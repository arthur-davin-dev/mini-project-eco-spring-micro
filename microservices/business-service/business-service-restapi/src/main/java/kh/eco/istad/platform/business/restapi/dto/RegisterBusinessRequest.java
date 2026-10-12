package kh.eco.istad.platform.business.restapi.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterBusinessRequest(
        @NotBlank(message = "legalName is required")
        @Size(max = 150, message = "legalName must be at most 150 characters")
        String legalName,

        @NotBlank(message = "displayName is required")
        @Size(max = 100, message = "displayName must be at most 100 characters")
        String displayName,

        @NotBlank(message = "email is required")
        @Email(message = "email is not valid")
        String email,

        @NotBlank(message = "phoneNumber is required")
        @Pattern(regexp = "^\\+?[0-9]{8,15}$", message = "phoneNumber must be 8-15 digits, optional leading +")
        String phoneNumber
) {
}