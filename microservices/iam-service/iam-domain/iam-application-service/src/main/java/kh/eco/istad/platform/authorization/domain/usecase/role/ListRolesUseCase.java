package kh.eco.istad.platform.authorization.domain.usecase.role;

import kh.eco.istad.platform.authorization.domain.dto.common.PageRequest;
import kh.eco.istad.platform.authorization.domain.dto.common.PageResult;
import kh.eco.istad.platform.authorization.domain.dto.role.command.RoleFilterQuery;
import kh.eco.istad.platform.authorization.domain.dto.role.result.RoleSummary;
import kh.eco.istad.platform.authorization.domain.port.out.RoleRepository;
import kh.eco.istad.platform.authorization.domain.usecase.shared.AuthorityResolver;

import java.time.Clock;
import java.util.List;
import kh.eco.istad.platform.authorization.domain.mapper.DomainDtoMapper;

public class ListRolesUseCase {

    private final RoleRepository roles;
    private final AuthorityResolver authorities;
    private final Clock clock;

    public ListRolesUseCase(RoleRepository roles, AuthorityResolver authorities, Clock clock) {
        this.roles = roles;
        this.authorities = authorities;
        this.clock = clock;
    }

    public PageResult<RoleSummary> execute(RoleFilterQuery filter, PageRequest page) {
        var found = roles.findAll(filter, page);
        var now = clock.instant();
        List<RoleSummary> content = found.content().stream()
                .map(role -> DomainDtoMapper.toRoleSummary(role, authorities.rolePermissionNames(List.of(role), now).stream()
                        .sorted().toList()))
                .toList();
        return new PageResult<>(content, found.page(), found.size(), found.totalElements(), found.totalPages());
    }
}
