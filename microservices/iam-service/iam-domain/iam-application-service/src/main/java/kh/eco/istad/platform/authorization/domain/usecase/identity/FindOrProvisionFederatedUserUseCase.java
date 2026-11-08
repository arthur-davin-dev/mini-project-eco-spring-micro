package kh.eco.istad.platform.authorization.domain.usecase.identity;

import kh.eco.istad.platform.authorization.domain.dto.user.result.AuthUserResult;
import kh.eco.istad.platform.authorization.domain.dto.identity.command.FederatedIdentityCommand;
import kh.eco.istad.platform.authorization.domain.exception.ConflictException;
import kh.eco.istad.platform.authorization.domain.exception.NotFoundException;
import kh.eco.istad.platform.authorization.domain.port.out.RoleRepository;
import kh.eco.istad.platform.authorization.domain.port.out.UserRepository;
import kh.eco.istad.platform.authorization.domain.usecase.shared.AuthorityResolver;
import kh.eco.istad.platform.authorization.domain.usecase.user.RegisterUserUseCase;
import kh.eco.istad.platform.authorization.domain.entity.assignment.UserRole;
import kh.eco.istad.platform.authorization.domain.entity.role.Role;
import kh.eco.istad.platform.authorization.domain.exception.DomainException;
import kh.eco.istad.platform.authorization.domain.entity.user.Identity;
import kh.eco.istad.platform.authorization.domain.entity.user.User;
import kh.eco.istad.platform.authorization.domain.entity.user.UserProfile;
import kh.eco.istad.platform.authorization.domain.valueobject.EmailAddress;
import kh.eco.istad.platform.authorization.domain.valueobject.Username;

import java.security.SecureRandom;
import java.time.Clock;
import java.time.Instant;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

public class FindOrProvisionFederatedUserUseCase {

    private static final Set<String> SUPPORTED_LOCALES = Set.of("en", "km");
    private static final int MAX_USERNAME_ATTEMPTS = 10;
    private static final SecureRandom RANDOM = new SecureRandom();

    private final UserRepository users;
    private final RoleRepository roles;
    private final AuthorityResolver authorities;
    private final Clock clock;

    public FindOrProvisionFederatedUserUseCase(
            UserRepository users,
            RoleRepository roles,
            AuthorityResolver authorities,
            Clock clock
    ) {
        this.users = users;
        this.roles = roles;
        this.authorities = authorities;
        this.clock = clock;
    }

    public AuthUserResult execute(FederatedIdentityCommand command) {
        Instant now = clock.instant();
        String actor = "social:" + command.provider().name().toLowerCase(Locale.ROOT);

        Optional<User> known = users.findByIdentity(command.provider(), command.providerSubject());
        User user = known.orElseGet(() -> linkOrProvision(command, actor, now));

        if (known.isPresent()) {
            Identity identity = user.getActiveIdentities().stream()
                    .filter(candidate -> candidate.getProvider() == command.provider()
                            && candidate.getProviderSubject().equals(command.providerSubject()))
                    .findFirst()
                    .orElseThrow(() -> new NotFoundException("Linked identity missing for user " + user.getUuid()));
            identity.refreshFromProvider(command.email(), command.emailVerified(), command.displayName(),
                    command.username(), command.pictureUrl(), actor, now);
            identity.recordLogin(actor, now);
        }

        user.ensureCanSignIn();
        user.recordSuccessfulLogin(actor, now);
        users.save(user);

        return new AuthUserResult(
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
                authorities.authorities(user.getUuid(), now));
    }

    private User linkOrProvision(FederatedIdentityCommand command, String actor, Instant now) {
        if (command.email() == null || command.email().isBlank()) {
            throw new DomainException("The " + command.provider() + " account did not share an email address");
        }
        EmailAddress email = new EmailAddress(command.email());

        Optional<User> sameEmail = users.findByUsernameOrEmail(email.value());
        if (sameEmail.isPresent() && command.emailVerified()) {
            User existing = sameEmail.get();
            Identity identity = newIdentity(command, actor, now);
            existing.linkIdentity(identity, actor, now);
            return existing;
        }
        if (sameEmail.isPresent()) {
            throw new ConflictException("An account with this email exists. Sign in with your password first, "
                    + "then link " + command.provider());
        }

        Role defaultRole = roles.findByName(RegisterUserUseCase.DEFAULT_ROLE)
                .orElseThrow(() -> new NotFoundException("Default role USER is not seeded"));

        String givenName = firstNonBlank(command.givenName(), command.displayName(), "User");
        String familyName = firstNonBlank(command.familyName(), "Member");
        String locale = supportedLocale(command.locale());

        Identity identity = newIdentity(command, actor, now);
        User created = User.provisionFromSocial(UUID.randomUUID(), availableUsername(command, email),
                email, command.emailVerified(), new UserProfile(givenName, familyName, null, null,
                        null, null, null, command.pictureUrl(), null, null, null, locale, null),
                identity, actor, now);
        users.save(created);
        users.saveUserRole(UserRole.assign(created.getUuid(), defaultRole, null, actor,
                "Default role on social sign-up", now));
        return created;
    }

    private static Identity newIdentity(
            FederatedIdentityCommand command,
            String actor,
            Instant now
    ) {
        return Identity.link(
                UUID.randomUUID(),
                command.provider(),
                command.providerSubject(),
                command.email(),
                command.emailVerified(),
                command.displayName(),
                command.username(),
                command.pictureUrl(),
                actor, now
        );
    }

    private Username availableUsername(
            FederatedIdentityCommand command,
            EmailAddress email
    ) {
        String seed = firstNonBlank(command.username(), email.value().substring(0, email.value().indexOf('@')));
        String base = seed.replaceAll("[^A-Za-z0-9._-]", "");
        if (base.length() < 3) {
            base = "user";
        }
        if (base.length() > 40) {
            base = base.substring(0, 40);
        }
        for (int attempt = 0; attempt < MAX_USERNAME_ATTEMPTS; attempt++) {
            String candidate = attempt == 0 ? base : base + "_" + (1000 + RANDOM.nextInt(9000));
            if (!users.existsByUsername(candidate)) {
                return new Username(candidate);
            }
        }
        throw new ConflictException("Could not find a free username for this account");
    }

    private static String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value.trim();
            }
        }
        return null;
    }

    static String supportedLocale(String locale) {
        return locale != null && SUPPORTED_LOCALES.contains(locale) ? locale : "en";
    }
}
