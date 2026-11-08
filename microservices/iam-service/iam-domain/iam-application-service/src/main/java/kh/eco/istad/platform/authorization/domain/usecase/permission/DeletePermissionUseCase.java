package kh.eco.istad.platform.authorization.domain.usecase.permission;

import kh.eco.istad.platform.authorization.domain.port.out.CurrentActorProvider;
import kh.eco.istad.platform.authorization.domain.port.out.PermissionRepository;
import kh.eco.istad.platform.authorization.domain.usecase.shared.Rules;
import kh.eco.istad.platform.authorization.domain.entity.permission.Permission;

import java.time.Clock;
import java.util.UUID;

public class DeletePermissionUseCase {

    private final PermissionRepository permissions;
    private final CurrentActorProvider actors;
    private final Clock clock;

    public DeletePermissionUseCase(PermissionRepository permissions, CurrentActorProvider actors, Clock clock) {
        this.permissions = permissions;
        this.actors = actors;
        this.clock = clock;
    }

    public void execute(UUID permissionUuid) {
        Permission permission = Rules.loadPermission(permissions, permissionUuid);
        permission.softDelete(actors.currentActor(), clock.instant());
        permissions.save(permission);
    }
}
