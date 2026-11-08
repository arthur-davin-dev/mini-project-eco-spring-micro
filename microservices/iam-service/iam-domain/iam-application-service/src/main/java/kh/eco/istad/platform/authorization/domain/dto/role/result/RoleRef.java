package kh.eco.istad.platform.authorization.domain.dto.role.result;

import java.util.UUID;

public record RoleRef(
        UUID uuid,
        String name
) {
}
