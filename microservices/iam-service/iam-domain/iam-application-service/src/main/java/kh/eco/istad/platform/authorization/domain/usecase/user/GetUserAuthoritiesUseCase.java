package kh.eco.istad.platform.authorization.domain.usecase.user;

import kh.eco.istad.platform.authorization.domain.dto.user.result.UserAuthoritiesResult;
import kh.eco.istad.platform.authorization.domain.port.out.UserRepository;
import kh.eco.istad.platform.authorization.domain.usecase.shared.AuthorityResolver;
import kh.eco.istad.platform.authorization.domain.usecase.shared.Rules;

import java.time.Clock;
import java.util.UUID;

public class GetUserAuthoritiesUseCase {

    private final UserRepository users;
    private final AuthorityResolver authorities;
    private final Clock clock;

    public GetUserAuthoritiesUseCase(UserRepository users, AuthorityResolver authorities, Clock clock) {
        this.users = users;
        this.authorities = authorities;
        this.clock = clock;
    }

    public UserAuthoritiesResult execute(UUID userUuid) {
        Rules.loadUser(users, userUuid);
        return authorities.resolve(userUuid, clock.instant());
    }
}
