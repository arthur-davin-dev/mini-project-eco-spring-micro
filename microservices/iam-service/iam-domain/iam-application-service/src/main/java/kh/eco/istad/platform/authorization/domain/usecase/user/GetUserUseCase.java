package kh.eco.istad.platform.authorization.domain.usecase.user;

import kh.eco.istad.platform.authorization.domain.dto.user.result.UserResult;
import kh.eco.istad.platform.authorization.domain.dto.role.result.RoleRef;
import kh.eco.istad.platform.authorization.domain.port.out.UserRepository;
import kh.eco.istad.platform.authorization.domain.usecase.shared.AuthorityResolver;
import kh.eco.istad.platform.authorization.domain.usecase.shared.Rules;
import kh.eco.istad.platform.authorization.domain.entity.user.User;

import java.time.Clock;
import java.util.UUID;
import kh.eco.istad.platform.authorization.domain.mapper.DomainDtoMapper;

public class GetUserUseCase {

    private final UserRepository users;
    private final AuthorityResolver authorities;
    private final Clock clock;

    public GetUserUseCase(UserRepository users, AuthorityResolver authorities, Clock clock) {
        this.users = users;
        this.authorities = authorities;
        this.clock = clock;
    }

    public UserResult execute(UUID userUuid) {
        User user = Rules.loadUser(users, userUuid);
        return DomainDtoMapper.toUserResult(user, authorities.activeRoles(userUuid, clock.instant()).stream()
                .map(role -> new RoleRef(role.getUuid(), role.getName())).toList());
    }
}
