package kh.eco.istad.platform.authorization.domain.entity.assignment;

import kh.eco.istad.platform.authorization.domain.entity.permission.Permission;
import kh.eco.istad.platform.authorization.domain.entity.role.Role;
import kh.eco.istad.platform.authorization.domain.exception.DomainException;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

public class RolePermission extends Assignment {

    private final UUID roleUuid;
    private final UUID permissionUuid;

    public static RolePermission restore(UUID roleUuid, UUID permissionUuid, Instant assignedAt,
                                         String assignedBy, Instant expiresAt, Instant revokedAt,
                                         String revokedBy, String reason) {
        RolePermission assignment = new RolePermission(roleUuid, permissionUuid, assignedAt,
                assignedBy, expiresAt, reason);
        assignment.restoreRevocation(revokedAt, revokedBy, reason);
        return assignment;
    }

    private RolePermission(UUID roleUuid, UUID permissionUuid, Instant assignedAt, String assignedBy,
                           Instant expiresAt, String reason) {
        super(assignedAt, assignedBy, expiresAt, reason);
        this.roleUuid = Objects.requireNonNull(roleUuid, "roleUuid");
        this.permissionUuid = Objects.requireNonNull(permissionUuid, "permissionUuid");
    }

    public static RolePermission assign(Role role, Permission permission, Instant expiresAt,
                                        String actor, String reason, Instant now) {
        Objects.requireNonNull(role, "role");
        Objects.requireNonNull(permission, "permission");
        if (role.isSystem()) {
            throw new DomainException("Permissions of system role '" + role.getName() + "' cannot be changed");
        }
        if (!role.isAssignable()) {
            throw new DomainException("Role '" + role.getName() + "' is inactive");
        }
        if (!permission.isAssignable()) {
            throw new DomainException("Permission '" + permission.name() + "' is inactive");
        }
        return new RolePermission(role.getUuid(), permission.getUuid(), now, actor, expiresAt, reason);
    }

    public static RolePermission seedSystem(Role role, Permission permission, String actor, Instant now) {
        Objects.requireNonNull(role, "role");
        Objects.requireNonNull(permission, "permission");
        if (!role.isSystem()) {
            throw new DomainException("seedSystem is only for system roles");
        }
        if (!permission.isAssignable()) {
            throw new DomainException("Permission '" + permission.name() + "' is inactive");
        }
        return new RolePermission(role.getUuid(), permission.getUuid(), now, actor, null, "Seeded");
    }

    public UUID getRoleUuid() {
        return roleUuid;
    }

    public UUID getPermissionUuid() {
        return permissionUuid;
    }
}
