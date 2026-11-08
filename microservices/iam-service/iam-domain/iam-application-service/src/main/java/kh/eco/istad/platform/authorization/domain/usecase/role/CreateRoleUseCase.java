package kh.eco.istad.platform.authorization.domain.usecase.role;

import kh.eco.istad.platform.authorization.domain.dto.role.command.CreateRoleCommand;
import kh.eco.istad.platform.authorization.domain.dto.role.result.RoleResult;
import kh.eco.istad.platform.authorization.domain.exception.ConflictException;
import kh.eco.istad.platform.authorization.domain.port.out.CurrentActorProvider;
import kh.eco.istad.platform.authorization.domain.port.out.PermissionRepository;
import kh.eco.istad.platform.authorization.domain.port.out.RoleRepository;
import kh.eco.istad.platform.authorization.domain.usecase.shared.AuthorityResolver;
import kh.eco.istad.platform.authorization.domain.usecase.shared.Rules;
import kh.eco.istad.platform.authorization.domain.entity.assignment.RolePermission;
import kh.eco.istad.platform.authorization.domain.entity.permission.Permission;
import kh.eco.istad.platform.authorization.domain.entity.role.Role;

import java.time.Clock;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import kh.eco.istad.platform.authorization.domain.mapper.DomainDtoMapper;

public class CreateRoleUseCase {

    private final RoleRepository roles;
    private final PermissionRepository permissions;
    private final AuthorityResolver authorities;
    private final CurrentActorProvider actors;
    private final Clock clock;

    public CreateRoleUseCase(
            RoleRepository roles,
            PermissionRepository permissions,
            AuthorityResolver authorities,
            CurrentActorProvider actors,
            Clock clock
    ) {
        this.roles = roles;
        this.permissions = permissions;
        this.authorities = authorities;
        this.actors = actors;
        this.clock = clock;
    }

    public RoleResult execute(CreateRoleCommand command) {
        String actor = actors.currentActor();
        Instant now = clock.instant();
        UUID uuid = UUID.randomUUID();

        Role role = Role.create(uuid, command.name(), command.description(), actor, now);
        if (roles.existsByName(role.getName())) {
            throw new ConflictException("Role '" + role.getName() + "' already exists");
        }
        roles.save(role);

        List<Permission> toAttach = command.permissionUuids().stream()
                .distinct()
                .map(permissionUuid -> Rules.loadPermission(permissions, permissionUuid))
                .toList();
        for (Permission permission : toAttach) {
            roles.saveRolePermission(RolePermission.assign(role, permission, null, actor,
                    "Attached on role creation", now));
        }

        return DomainDtoMapper.toRoleResult(role, authorities.rolePermissionNames(List.of(role), now).stream().sorted().toList());
    }
}
