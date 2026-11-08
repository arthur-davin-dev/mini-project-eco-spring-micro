package kh.eco.istad.platform.authorization.domain.dto.user.command;

import java.util.List;
import java.util.UUID;

public record CreateUserCommand(
        String username,
        String email,
        String password,
        String confirmPassword,
        UserProfileCommand profile,
        List<UUID> roleUuids
) {
    public CreateUserCommand {
        roleUuids = roleUuids == null ? List.of() : List.copyOf(roleUuids);
    }
}
