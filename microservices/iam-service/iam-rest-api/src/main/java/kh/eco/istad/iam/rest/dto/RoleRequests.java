package kh.eco.istad.iam.rest.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public final class RoleRequests {

    private RoleRequests() {
    }

    public record CreateRoleRequest(
            @NotBlank @Size(min = 2, max = 50) String name,
            @Size(max = 255) String description,
            List<UUID> permissionUuids
    ) {
    }

    public record UpdateRoleRequest(@Size(max = 255) String description) {
    }

    public record AssignPermissionsToRoleRequest(
            @NotEmpty List<UUID> permissionUuids,
            Instant expiresAt,
            String reason
    ) {
    }
}
