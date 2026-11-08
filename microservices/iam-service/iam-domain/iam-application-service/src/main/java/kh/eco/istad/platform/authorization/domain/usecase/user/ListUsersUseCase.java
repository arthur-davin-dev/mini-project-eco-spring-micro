package kh.eco.istad.platform.authorization.domain.usecase.user;

import kh.eco.istad.platform.authorization.domain.dto.common.PageRequest;
import kh.eco.istad.platform.authorization.domain.dto.common.PageResult;
import kh.eco.istad.platform.authorization.domain.dto.user.command.UserFilterQuery;
import kh.eco.istad.platform.authorization.domain.dto.user.result.UserSummary;
import kh.eco.istad.platform.authorization.domain.dto.role.result.RoleRef;
import kh.eco.istad.platform.authorization.domain.port.out.UserRepository;
import kh.eco.istad.platform.authorization.domain.usecase.shared.AuthorityResolver;

import java.time.Clock;
import java.util.List;
import kh.eco.istad.platform.authorization.domain.mapper.DomainDtoMapper;

public class ListUsersUseCase {

    private final UserRepository users;
    private final AuthorityResolver authorities;
    private final Clock clock;

    public ListUsersUseCase(UserRepository users, AuthorityResolver authorities, Clock clock) {
        this.users = users;
        this.authorities = authorities;
        this.clock = clock;
    }

    public PageResult<UserSummary> execute(UserFilterQuery filter, PageRequest page) {
        var found = users.findAll(filter, page);
        var now = clock.instant();
        List<UserSummary> content = found.content().stream()
                .map(user -> DomainDtoMapper.toUserSummary(user, authorities.activeRoles(user.getUuid(), now).stream()
                        .map(role -> new RoleRef(role.getUuid(), role.getName())).toList()))
                .toList();
        return new PageResult<>(content, found.page(), found.size(), found.totalElements(), found.totalPages());
    }
}
