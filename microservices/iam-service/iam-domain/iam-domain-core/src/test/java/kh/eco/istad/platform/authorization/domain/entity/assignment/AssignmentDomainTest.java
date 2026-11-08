package kh.eco.istad.platform.authorization.domain.entity.assignment;

import kh.eco.istad.platform.authorization.domain.entity.permission.Permission;
import kh.eco.istad.platform.authorization.domain.entity.role.Role;
import kh.eco.istad.platform.authorization.domain.exception.DomainException;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class AssignmentDomainTest {

    private static final Instant NOW = Instant.parse("2026-11-07T00:00:00Z");

    @Test
    void assignmentExpiresAtItsBoundaryAndCanOnlyBeRevokedOnce() {
        Role role = Role.create(UUID.randomUUID(), "ORDER_MANAGER", null, "admin", NOW);
        UserRole assignment = UserRole.assign(UUID.randomUUID(), role, NOW.plusSeconds(60),
                "admin", "temporary access", NOW);

        assertTrue(assignment.isActiveAt(NOW.plusSeconds(59)));
        assertFalse(assignment.isActiveAt(NOW.plusSeconds(60)));
        assertThrows(DomainException.class, () -> assignment.revoke("admin", "bad time", NOW.minusSeconds(1)));
        assertThrows(DomainException.class, () -> assignment.revoke("admin", "x".repeat(256), NOW));
        assertTrue(assignment.getRevokedAt() == null, "Rejected revoke must not partially mutate the assignment");

        assignment.revoke("admin", "ended", NOW.plusSeconds(1));
        assertFalse(assignment.isActiveAt(NOW.plusSeconds(2)));
        assertThrows(DomainException.class, () -> assignment.revoke("admin", "again", NOW.plusSeconds(2)));
    }

    @Test
    void inactiveAndSystemEntitiesCannotReceiveOrdinaryAssignments() {
        Role systemRole = Role.seedSystem(UUID.randomUUID(), "ADMIN", "Built in", "system", NOW);
        Permission permission = Permission.create(UUID.randomUUID(), "user", "read", null, "admin", NOW);
        assertThrows(DomainException.class, () -> RolePermission.assign(systemRole, permission,
                null, "admin", "ordinary edit", NOW));

        Role inactiveRole = Role.create(UUID.randomUUID(), "OLD_ROLE", null, "admin", NOW);
        inactiveRole.deactivate("admin", NOW.plusSeconds(1));
        assertThrows(DomainException.class, () -> UserRole.assign(UUID.randomUUID(), inactiveRole,
                null, "admin", null, NOW.plusSeconds(2)));
    }

    @Test
    void systemRoleAndPermissionCannotBeMutatedOrRestoredInvalid() {
        Role role = Role.seedSystem(UUID.randomUUID(), "ADMIN", "Built in", "system", NOW);
        Permission permission = Permission.seedSystem(UUID.randomUUID(), "user", "read", null, "system", NOW);

        assertThrows(DomainException.class, () -> role.updateDescription("changed", "admin", NOW.plusSeconds(1)));
        assertThrows(DomainException.class, () -> role.softDelete("admin", NOW.plusSeconds(1)));
        assertThrows(DomainException.class, () -> permission.deactivate("admin", NOW.plusSeconds(1)));
        assertThrows(DomainException.class, () -> Permission.restore(permission.getUuid(), "user", "read",
                null, true, false, false, null, null, "system", NOW, "system", NOW, 0));
        assertThrows(DomainException.class, () -> Role.restore(role.getUuid(), "ADMIN", "Built in",
                true, false, false, null, null, "system", NOW, "system", NOW, 0));
    }
}
