package kh.eco.istad.platform.authorization.domain.usecase.permission;

import kh.eco.istad.platform.authorization.domain.dto.permission.result.PermissionResult;
import kh.eco.istad.platform.authorization.domain.dto.permission.command.UpdatePermissionCommand;
import kh.eco.istad.platform.authorization.domain.port.out.CurrentActorProvider;
import kh.eco.istad.platform.authorization.domain.port.out.PermissionRepository;
import kh.eco.istad.platform.authorization.domain.usecase.shared.Rules;
import kh.eco.istad.platform.authorization.domain.entity.permission.Permission;

import java.time.Clock;
import java.util.UUID;
import kh.eco.istad.platform.authorization.domain.mapper.DomainDtoMapper;

public class UpdatePermissionUseCase {

    private final PermissionRepository permissions;
    private final CurrentActorProvider actors;
    private final Clock clock;

    public UpdatePermissionUseCase(PermissionRepository permissions, CurrentActorProvider actors, Clock clock) {
        this.permissions = permissions;
        this.actors = actors;
        this.clock = clock;
    }

    public PermissionResult execute(UUID permissionUuid, UpdatePermissionCommand command) {
        Permission permission = Rules.loadPermission(permissions, permissionUuid);
        permission.updateDescription(command.description(), actors.currentActor(), clock.instant());
        permissions.save(permission);
        return DomainDtoMapper.toPermissionResult(permission);
    }
}
