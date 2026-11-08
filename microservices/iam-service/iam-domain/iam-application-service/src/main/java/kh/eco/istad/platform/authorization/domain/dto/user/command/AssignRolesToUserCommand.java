package kh.eco.istad.platform.authorization.domain.dto.user.command;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record AssignRolesToUserCommand(
        List<UUID> roleUuids,
        Instant expiresAt,
        String reason
) {

    public AssignRolesToUserCommand {
        roleUuids = roleUuids == null ? List.of() : List.copyOf(roleUuids);
    }
}
