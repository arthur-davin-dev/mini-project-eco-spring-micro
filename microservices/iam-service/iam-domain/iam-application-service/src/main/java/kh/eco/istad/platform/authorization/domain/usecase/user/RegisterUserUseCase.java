package kh.eco.istad.platform.authorization.domain.usecase.user;

import kh.eco.istad.platform.authorization.domain.dto.user.command.RegisterUserCommand;
import kh.eco.istad.platform.authorization.domain.dto.role.result.RoleRef;
import kh.eco.istad.platform.authorization.domain.dto.user.result.UserResult;
import kh.eco.istad.platform.authorization.domain.exception.NotFoundException;
import kh.eco.istad.platform.authorization.domain.port.out.PasswordHasher;
import kh.eco.istad.platform.authorization.domain.port.out.RoleRepository;
import kh.eco.istad.platform.authorization.domain.port.out.UserRepository;
import kh.eco.istad.platform.authorization.domain.usecase.shared.Rules;
import kh.eco.istad.platform.authorization.domain.entity.assignment.UserRole;
import kh.eco.istad.platform.authorization.domain.entity.role.Role;
import kh.eco.istad.platform.authorization.domain.entity.user.User;
import kh.eco.istad.platform.authorization.domain.entity.user.UserProfile;
import kh.eco.istad.platform.authorization.domain.valueobject.EmailAddress;
import kh.eco.istad.platform.authorization.domain.valueobject.Username;

import java.time.Clock;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import kh.eco.istad.platform.authorization.domain.mapper.DomainDtoMapper;

/** Self-registration. The new account gets the default USER role. */
public class RegisterUserUseCase {

    public static final String DEFAULT_ROLE = "USER";

    private final UserRepository users;
    private final RoleRepository roles;
    private final PasswordHasher hasher;
    private final Clock clock;

    public RegisterUserUseCase(UserRepository users, RoleRepository roles, PasswordHasher hasher, Clock clock) {
        this.users = users;
        this.roles = roles;
        this.hasher = hasher;
        this.clock = clock;
    }

    public UserResult execute(RegisterUserCommand command) {
        Rules.checkNewPassword(command.password(), command.confirmPassword());
        Username username = new Username(command.username());
        EmailAddress email = new EmailAddress(command.email());
        Rules.ensureUsernameAndEmailAvailable(users, username, email);

        Role defaultRole = roles.findByName(DEFAULT_ROLE)
                .orElseThrow(() -> new NotFoundException("Default role " + DEFAULT_ROLE + " is not seeded"));

        Instant now = clock.instant();
        User user = User.register(UUID.randomUUID(), username, email, hasher.hash(command.password()),
                new UserProfile(command.givenName(), command.familyName(), null, null, null, null,
                        null, null, null, null, null, command.locale(), null), username.value(), now);
        users.save(user);
        users.saveUserRole(UserRole.assign(user.getUuid(), defaultRole, null, username.value(),
                "Default role on registration", now));

        return DomainDtoMapper.toUserResult(user, List.of(new RoleRef(defaultRole.getUuid(), defaultRole.getName())));
    }
}
