package kh.eco.istad.platform.authorization.domain.dto.user.result;

import kh.eco.istad.platform.authorization.domain.entity.assignment.PermissionEffect;

import java.time.Instant;
import java.util.UUID;

public record PermissionGrantResult(
        UUID permissionUuid,
        String permissionName,
        PermissionEffect effect,
        Instant expiresAt
) {
}
