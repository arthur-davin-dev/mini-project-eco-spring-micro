package kh.eco.istad.platform.authorization.domain.usecase.permission;

import kh.eco.istad.platform.authorization.domain.dto.permission.command.CreatePermissionCommand;
import kh.eco.istad.platform.authorization.domain.dto.permission.result.PermissionResult;
import kh.eco.istad.platform.authorization.domain.exception.ConflictException;
import kh.eco.istad.platform.authorization.domain.port.out.CurrentActorProvider;
import kh.eco.istad.platform.authorization.domain.port.out.PermissionRepository;
import kh.eco.istad.platform.authorization.domain.entity.permission.Permission;

import java.time.Clock;
import java.util.UUID;
import kh.eco.istad.platform.authorization.domain.mapper.DomainDtoMapper;

public class CreatePermissionUseCase {

    private final PermissionRepository permissions;
    private final CurrentActorProvider actors;
    private final Clock clock;

    public CreatePermissionUseCase(PermissionRepository permissions, CurrentActorProvider actors, Clock clock) {
        this.permissions = permissions;
        this.actors = actors;
        this.clock = clock;
    }

    public PermissionResult execute(CreatePermissionCommand command) {
        Permission permission = Permission.create(UUID.randomUUID(), command.resource(), command.action(),
                command.description(), actors.currentActor(), clock.instant());
        if (permissions.existsByResourceAndAction(permission.getResource(), permission.getAction())) {
            throw new ConflictException("Permission '" + permission.name() + "' already exists");
        }
        permissions.save(permission);
        return DomainDtoMapper.toPermissionResult(permission);
    }
}
