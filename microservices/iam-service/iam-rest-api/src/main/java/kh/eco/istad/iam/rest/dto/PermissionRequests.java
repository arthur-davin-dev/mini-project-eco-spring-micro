package kh.eco.istad.iam.rest.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public final class PermissionRequests {

    private PermissionRequests() {
    }

    public record CreatePermissionRequest(
            @NotBlank @Pattern(regexp = "^[a-z][a-z_]{1,49}$") String resource,
            @NotBlank @Pattern(regexp = "^[a-z][a-z_]{1,49}$") String action,
            @Size(max = 255) String description
    ) {
    }

    public record UpdatePermissionRequest(@Size(max = 255) String description) {
    }
}
