package kh.eco.istad.platform.authorization.domain.usecase.user;

import kh.eco.istad.platform.authorization.domain.dto.user.command.GrantPermissionsToUserCommand;
import kh.eco.istad.platform.authorization.domain.dto.user.result.PermissionGrantResult;
import kh.eco.istad.platform.authorization.domain.exception.ConflictException;
import kh.eco.istad.platform.authorization.domain.port.out.CurrentActorProvider;
import kh.eco.istad.platform.authorization.domain.port.out.PermissionRepository;
import kh.eco.istad.platform.authorization.domain.port.out.UserRepository;
import kh.eco.istad.platform.authorization.domain.usecase.shared.Rules;
import kh.eco.istad.platform.authorization.domain.entity.assignment.UserPermission;
import kh.eco.istad.platform.authorization.domain.entity.permission.Permission;
import kh.eco.istad.platform.authorization.domain.entity.user.User;

import java.time.Clock;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class GrantPermissionsToUserUseCase {

    private final UserRepository users;
    private final PermissionRepository permissions;
    private final CurrentActorProvider actors;
    private final Clock clock;

    public GrantPermissionsToUserUseCase(UserRepository users, PermissionRepository permissions,
                                         CurrentActorProvider actors, Clock clock) {
        this.users = users;
        this.permissions = permissions;
        this.actors = actors;
        this.clock = clock;
    }

    public List<PermissionGrantResult> execute(UUID userUuid, GrantPermissionsToUserCommand command) {
        User user = Rules.loadUser(users, userUuid);
        String actor = actors.currentActor();
        Instant now = clock.instant();

        List<PermissionGrantResult> results = new ArrayList<>();
        for (UUID permissionUuid : command.permissionUuids().stream().distinct().toList()) {
            Permission permission = Rules.loadPermission(permissions, permissionUuid);
            boolean alreadyActive = users.findUserPermission(user.getUuid(), permissionUuid)
                    .filter(link -> link.isActiveAt(now))
                    .isPresent();
            if (alreadyActive) {
                throw new ConflictException("Permission '" + permission.name()
                        + "' already has an active entry for this user");
            }
            users.saveUserPermission(UserPermission.assign(user.getUuid(), permission, command.effect(),
                    command.expiresAt(), actor, command.reason(), now));
            results.add(new PermissionGrantResult(permission.getUuid(), permission.name(),
                    command.effect(), command.expiresAt()));
        }
        return results;
    }
}
