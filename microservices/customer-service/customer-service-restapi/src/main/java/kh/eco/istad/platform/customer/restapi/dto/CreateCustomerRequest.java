package kh.eco.istad.platform.customer.restapi.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreateCustomerRequest(
        @NotBlank(message = "username is required")
        @Size(min = 3, max = 50, message = "username must be 3-50 characters")
        @Pattern(regexp = "^[A-Za-z0-9._-]+$", message = "username may only contain letters, digits, . _ -")
        String username,

        @NotBlank(message = "familyName is required")
        @Size(max = 100, message = "familyName must be at most 100 characters")
        String familyName,

        @NotBlank(message = "givenName is required")
        @Size(max = 100, message = "givenName must be at most 100 characters")
        String givenName,

        @NotBlank(message = "email is required")
        @Email(message = "email is not valid")
        @Size(max = 254, message = "email must be at most 254 characters")
        String email,

        @NotBlank(message = "phoneNumber is required")
        @Pattern(regexp = "^\\+?[0-9]{8,15}$", message = "phoneNumber must be 8-15 digits, optional leading +")
        String phoneNumber
) {
}