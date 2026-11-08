package kh.eco.istad.platform.authorization.domain.usecase.role;

import kh.eco.istad.platform.authorization.domain.dto.role.command.AssignPermissionsToRoleCommand;
import kh.eco.istad.platform.authorization.domain.dto.permission.result.PermissionAssignmentResult;
import kh.eco.istad.platform.authorization.domain.exception.ConflictException;
import kh.eco.istad.platform.authorization.domain.port.out.CurrentActorProvider;
import kh.eco.istad.platform.authorization.domain.port.out.PermissionRepository;
import kh.eco.istad.platform.authorization.domain.port.out.RoleRepository;
import kh.eco.istad.platform.authorization.domain.usecase.shared.Rules;
import kh.eco.istad.platform.authorization.domain.entity.assignment.RolePermission;
import kh.eco.istad.platform.authorization.domain.entity.permission.Permission;
import kh.eco.istad.platform.authorization.domain.entity.role.Role;

import java.time.Clock;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class AssignPermissionsToRoleUseCase {

    private final RoleRepository roles;
    private final PermissionRepository permissions;
    private final CurrentActorProvider actors;
    private final Clock clock;

    public AssignPermissionsToRoleUseCase(RoleRepository roles, PermissionRepository permissions,
                                          CurrentActorProvider actors, Clock clock) {
        this.roles = roles;
        this.permissions = permissions;
        this.actors = actors;
        this.clock = clock;
    }

    public List<PermissionAssignmentResult> execute(UUID roleUuid, AssignPermissionsToRoleCommand command) {
        Role role = Rules.loadRole(roles, roleUuid);
        String actor = actors.currentActor();
        Instant now = clock.instant();

        List<PermissionAssignmentResult> results = new ArrayList<>();
        for (UUID permissionUuid : command.permissionUuids().stream().distinct().toList()) {
            Permission permission = Rules.loadPermission(permissions, permissionUuid);
            boolean alreadyActive = roles.findRolePermission(role.getUuid(), permissionUuid)
                    .filter(link -> link.isActiveAt(now))
                    .isPresent();
            if (alreadyActive) {
                throw new ConflictException("Permission '" + permission.name() + "' is already on this role");
            }
            roles.saveRolePermission(RolePermission.assign(role, permission, command.expiresAt(), actor,
                    command.reason(), now));
            results.add(new PermissionAssignmentResult(permission.getUuid(), permission.name(), command.expiresAt()));
        }
        return results;
    }
}
