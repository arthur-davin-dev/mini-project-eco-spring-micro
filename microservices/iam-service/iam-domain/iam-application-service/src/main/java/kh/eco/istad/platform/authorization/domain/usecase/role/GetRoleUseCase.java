package kh.eco.istad.platform.authorization.domain.usecase.role;

import kh.eco.istad.platform.authorization.domain.dto.role.result.RoleResult;
import kh.eco.istad.platform.authorization.domain.port.out.RoleRepository;
import kh.eco.istad.platform.authorization.domain.usecase.shared.AuthorityResolver;
import kh.eco.istad.platform.authorization.domain.usecase.shared.Rules;
import kh.eco.istad.platform.authorization.domain.entity.role.Role;

import java.time.Clock;
import java.util.List;
import java.util.UUID;
import kh.eco.istad.platform.authorization.domain.mapper.DomainDtoMapper;

public class GetRoleUseCase {

    private final RoleRepository roles;
    private final AuthorityResolver authorities;
    private final Clock clock;

    public GetRoleUseCase(RoleRepository roles, AuthorityResolver authorities, Clock clock) {
        this.roles = roles;
        this.authorities = authorities;
        this.clock = clock;
    }

    public RoleResult execute(UUID roleUuid) {
        Role role = Rules.loadRole(roles, roleUuid);
        return DomainDtoMapper.toRoleResult(role, authorities.rolePermissionNames(List.of(role), clock.instant()).stream()
                .sorted().toList());
    }
}
