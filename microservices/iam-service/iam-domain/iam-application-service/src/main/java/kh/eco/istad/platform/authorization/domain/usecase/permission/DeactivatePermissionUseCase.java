package kh.eco.istad.platform.authorization.domain.usecase.permission;

import kh.eco.istad.platform.authorization.domain.port.out.CurrentActorProvider;
import kh.eco.istad.platform.authorization.domain.port.out.PermissionRepository;
import kh.eco.istad.platform.authorization.domain.usecase.shared.Rules;
import kh.eco.istad.platform.authorization.domain.entity.permission.Permission;

import java.time.Clock;
import java.util.UUID;

public class DeactivatePermissionUseCase {

    private final PermissionRepository permissions;
    private final CurrentActorProvider actors;
    private final Clock clock;

    public DeactivatePermissionUseCase(PermissionRepository permissions, CurrentActorProvider actors, Clock clock) {
        this.permissions = permissions;
        this.actors = actors;
        this.clock = clock;
    }

    public void execute(UUID permissionUuid) {
        Permission permission = Rules.loadPermission(permissions, permissionUuid);
        permission.deactivate(actors.currentActor(), clock.instant());
        permissions.save(permission);
    }
}
