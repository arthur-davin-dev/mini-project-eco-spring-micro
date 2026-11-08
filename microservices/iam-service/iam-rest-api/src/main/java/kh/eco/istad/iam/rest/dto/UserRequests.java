package kh.eco.istad.iam.rest.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import kh.eco.istad.platform.authorization.domain.entity.assignment.PermissionEffect;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public final class UserRequests {

    private UserRequests() {
    }

    public record RegisterUserRequest(
            @NotBlank @Size(min = 3, max = 50) String username,
            @NotBlank @Email String email,
            @NotBlank @Size(min = 8, max = 72) String password,
            @NotBlank String confirmPassword,
            @NotBlank @Size(max = 100) String givenName,
            @NotBlank @Size(max = 100) String familyName,
            @NotBlank @Pattern(regexp = "en|km") String locale
    ) {
    }

    public record CreateUserRequest(
            @NotBlank @Size(min = 3, max = 50) String username,
            @NotBlank @Email String email,
            @NotBlank @Size(min = 8, max = 72) String password,
            @NotBlank String confirmPassword,
            @NotBlank @Size(max = 100) String givenName,
            @NotBlank @Size(max = 100) String familyName,
            @Pattern(regexp = "female|male|other") String gender,
            LocalDate birthdate,
            String phoneNumber,
            String zoneinfo,
            @NotBlank @Pattern(regexp = "en|km") String locale,
            AddressRequest address,
            List<UUID> roleUuids
    ) {
    }

    public record AddressRequest(
            String streetAddress,
            String locality,
            String region,
            String postalCode,
            String country
    ) {
    }

    public record UpdateUserProfileRequest(
            @Size(max = 100) String givenName,
            @Size(max = 100) String nickname,
            String phoneNumber,
            @Pattern(regexp = "en|km") String locale
    ) {
    }

    public record ChangePasswordRequest(
            @NotBlank String currentPassword,
            @NotBlank @Size(min = 8, max = 72) String newPassword,
            @NotBlank String confirmPassword
    ) {
    }

    public record ResetUserPasswordRequest(
            @NotBlank @Size(min = 8, max = 72) String newPassword,
            @NotBlank String confirmPassword
    ) {
    }

    public record AssignRolesToUserRequest(
            @NotEmpty List<UUID> roleUuids,
            Instant expiresAt,
            String reason
    ) {
    }

    public record GrantPermissionsToUserRequest(
            @NotEmpty List<UUID> permissionUuids,
            @NotNull PermissionEffect effect,
            Instant expiresAt,
            String reason
    ) {
    }
}
