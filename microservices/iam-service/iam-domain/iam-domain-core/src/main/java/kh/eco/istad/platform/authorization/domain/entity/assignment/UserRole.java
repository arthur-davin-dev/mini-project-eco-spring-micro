package kh.eco.istad.platform.authorization.domain.entity.assignment;

import kh.eco.istad.platform.authorization.domain.entity.role.Role;
import kh.eco.istad.platform.authorization.domain.exception.DomainException;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

public class UserRole extends Assignment {

    private final UUID userUuid;
    private final UUID roleUuid;

    public static UserRole restore(UUID userUuid, UUID roleUuid, Instant assignedAt, String assignedBy,
                                   Instant expiresAt, Instant revokedAt, String revokedBy, String reason) {
        UserRole assignment = new UserRole(userUuid, roleUuid, assignedAt, assignedBy, expiresAt, reason);
        assignment.restoreRevocation(revokedAt, revokedBy, reason);
        return assignment;
    }

    private UserRole(UUID userUuid, UUID roleUuid, Instant assignedAt, String assignedBy,
                     Instant expiresAt, String reason) {
        super(assignedAt, assignedBy, expiresAt, reason);
        this.userUuid = Objects.requireNonNull(userUuid, "userUuid");
        this.roleUuid = Objects.requireNonNull(roleUuid, "roleUuid");
    }


    public static UserRole assign(UUID userUuid, Role role, Instant expiresAt,
                                  String actor, String reason, Instant now) {
        Objects.requireNonNull(userUuid, "userUuid");
        Objects.requireNonNull(role, "role");
        if (!role.isAssignable()) {
            throw new DomainException(
                    "Role '" + role.getName() + "' is inactive and cannot be assigned");
        }
        return new UserRole(userUuid, role.getUuid(), now, actor, expiresAt, reason);
    }

    public UUID getUserUuid() {
        return userUuid;
    }

    public UUID getRoleUuid() {
        return roleUuid;
    }
}
