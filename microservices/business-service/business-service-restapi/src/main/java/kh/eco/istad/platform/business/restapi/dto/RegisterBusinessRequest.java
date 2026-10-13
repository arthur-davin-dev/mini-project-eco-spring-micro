package kh.eco.istad.platform.business.restapi.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;
import java.util.List;

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
        String phoneNumber,
        List<@Valid ProductRequest> products
) {
    public RegisterBusinessRequest(String legalName, String displayName, String email, String phoneNumber) {
        this(legalName, displayName, email, phoneNumber, null);
    }
    public record ProductRequest(@NotBlank String name, @NotNull @Positive BigDecimal price,
                                 @PositiveOrZero int quantity) { }
}
