package kh.eco.istad.platform.authorization.domain.usecase.user;

import kh.eco.istad.platform.authorization.domain.dto.user.command.CreateUserCommand;
import kh.eco.istad.platform.authorization.domain.dto.user.command.UserProfileCommand;
import kh.eco.istad.platform.authorization.domain.dto.role.result.RoleRef;
import kh.eco.istad.platform.authorization.domain.dto.user.result.UserResult;
import kh.eco.istad.platform.authorization.domain.port.out.CurrentActorProvider;
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

public class CreateUserUseCase {

    private final UserRepository users;
    private final RoleRepository roles;
    private final PasswordHasher hasher;
    private final CurrentActorProvider actors;
    private final Clock clock;

    public CreateUserUseCase(UserRepository users, RoleRepository roles, PasswordHasher hasher,
                             CurrentActorProvider actors, Clock clock) {
        this.users = users;
        this.roles = roles;
        this.hasher = hasher;
        this.actors = actors;
        this.clock = clock;
    }

    public UserResult execute(CreateUserCommand command) {
        Rules.checkNewPassword(command.password(), command.confirmPassword());
        Username username = new Username(command.username());
        EmailAddress email = new EmailAddress(command.email());
        Rules.ensureUsernameAndEmailAvailable(users, username, email);

        List<Role> initialRoles = command.roleUuids().stream()
                .distinct()
                .map(uuid -> Rules.loadRole(roles, uuid))
                .toList();

        String actor = actors.currentActor();
        Instant now = clock.instant();
        User user = User.register(UUID.randomUUID(), username, email, hasher.hash(command.password()),
                toProfile(command.profile()), actor, now);
        users.save(user);
        for (Role role : initialRoles) {
            users.saveUserRole(UserRole.assign(user.getUuid(), role, null, actor, "Assigned on creation", now));
        }

        return DomainDtoMapper.toUserResult(user, initialRoles.stream()
                .map(role -> new RoleRef(role.getUuid(), role.getName())).toList());
    }

    private static UserProfile toProfile(UserProfileCommand profile) {
        if (profile == null) {
            throw new IllegalArgumentException("Profile is required");
        }
        return new UserProfile(profile.givenName(), profile.familyName(), profile.middleName(),
                profile.nickname(), profile.gender(), profile.birthdate(), profile.phoneNumber(),
                profile.pictureUrl(), profile.websiteUrl(), profile.profileUrl(), profile.zoneinfo(),
                profile.locale(), profile.address());
    }
}
