package kh.eco.istad.platform.authorization.domain.usecase.user;

import kh.eco.istad.platform.authorization.domain.dto.user.result.AuthUserResult;
import kh.eco.istad.platform.authorization.domain.port.out.UserRepository;
import kh.eco.istad.platform.authorization.domain.usecase.shared.AuthorityResolver;

import java.time.Clock;
import java.util.Optional;

public class LoadUserForAuthenticationUseCase {

    private final UserRepository users;
    private final AuthorityResolver authorities;
    private final Clock clock;

    public LoadUserForAuthenticationUseCase(UserRepository users, AuthorityResolver authorities, Clock clock) {
        this.users = users;
        this.authorities = authorities;
        this.clock = clock;
    }

    public Optional<AuthUserResult> execute(String usernameOrEmail) {
        if (usernameOrEmail == null || usernameOrEmail.isBlank()) {
            return Optional.empty();
        }
        return users.findByUsernameOrEmail(usernameOrEmail.trim())
                .map(user -> new AuthUserResult(
                        user.getUuid(),
                        user.getUsername().value(),
                        user.getEmail().value(),
                        user.isEmailVerified(),
                        user.getProfile(),
                        user.getUpdatedAt(),
                        user.getPasswordHash(),
                        user.isEnabled(),
                        user.isAccountNonExpired(),
                        user.isAccountNonLocked(),
                        user.isCredentialsNonExpired(),
                        authorities.authorities(user.getUuid(), clock.instant())));
    }
}
