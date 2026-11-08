package kh.eco.istad.platform.authorization.domain.usecase.role;

import kh.eco.istad.platform.authorization.domain.dto.role.result.RoleResult;
import kh.eco.istad.platform.authorization.domain.dto.role.command.UpdateRoleCommand;
import kh.eco.istad.platform.authorization.domain.port.out.CurrentActorProvider;
import kh.eco.istad.platform.authorization.domain.port.out.RoleRepository;
import kh.eco.istad.platform.authorization.domain.usecase.shared.AuthorityResolver;
import kh.eco.istad.platform.authorization.domain.usecase.shared.Rules;
import kh.eco.istad.platform.authorization.domain.entity.role.Role;

import java.time.Clock;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import kh.eco.istad.platform.authorization.domain.mapper.DomainDtoMapper;

public class UpdateRoleUseCase {

    private final RoleRepository roles;
    private final AuthorityResolver authorities;
    private final CurrentActorProvider actors;
    private final Clock clock;

    public UpdateRoleUseCase(RoleRepository roles, AuthorityResolver authorities,
                             CurrentActorProvider actors, Clock clock) {
        this.roles = roles;
        this.authorities = authorities;
        this.actors = actors;
        this.clock = clock;
    }

    public RoleResult execute(UUID roleUuid, UpdateRoleCommand command) {
        Role role = Rules.loadRole(roles, roleUuid);
        Instant now = clock.instant();
        role.updateDescription(command.description(), actors.currentActor(), now);
        roles.save(role);
        return DomainDtoMapper.toRoleResult(role, authorities.rolePermissionNames(List.of(role), now).stream().sorted().toList());
    }
}
