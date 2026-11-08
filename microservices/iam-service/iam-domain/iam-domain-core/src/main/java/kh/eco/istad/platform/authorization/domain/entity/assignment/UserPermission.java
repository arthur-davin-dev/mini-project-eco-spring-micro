package kh.eco.istad.platform.authorization.domain.entity.assignment;

import kh.eco.istad.platform.authorization.domain.entity.permission.Permission;
import kh.eco.istad.platform.authorization.domain.exception.DomainException;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

public class UserPermission extends Assignment {

    private final UUID userUuid;
    private final UUID permissionUuid;
    private final PermissionEffect effect;

    public static UserPermission restore(UUID userUuid, UUID permissionUuid, PermissionEffect effect,
                                         Instant assignedAt, String assignedBy, Instant expiresAt,
                                         Instant revokedAt, String revokedBy, String reason) {
        UserPermission assignment = new UserPermission(userUuid, permissionUuid, effect, assignedAt,
                assignedBy, expiresAt, reason);
        assignment.restoreRevocation(revokedAt, revokedBy, reason);
        return assignment;
    }

    private UserPermission(UUID userUuid, UUID permissionUuid, PermissionEffect effect, Instant assignedAt,
                           String assignedBy, Instant expiresAt, String reason) {
        super(assignedAt, assignedBy, expiresAt, reason);
        this.userUuid = Objects.requireNonNull(userUuid, "userUuid");
        this.permissionUuid = Objects.requireNonNull(permissionUuid, "permissionUuid");
        this.effect = Objects.requireNonNull(effect, "effect");
    }

    public static UserPermission assign(UUID userUuid, Permission permission, PermissionEffect effect,
                                        Instant expiresAt, String actor, String reason, Instant now) {
        Objects.requireNonNull(userUuid, "userUuid");
        Objects.requireNonNull(permission, "permission");
        Objects.requireNonNull(effect, "effect");
        if (!permission.isAssignable()) {
            throw new DomainException("Permission '" + permission.name() + "' is inactive");
        }
        return new UserPermission(userUuid, permission.getUuid(), effect, now, actor, expiresAt, reason);
    }

    public UUID getUserUuid() {
        return userUuid;
    }

    public UUID getPermissionUuid() {
        return permissionUuid;
    }

    public PermissionEffect getEffect() {
        return effect;
    }
}
