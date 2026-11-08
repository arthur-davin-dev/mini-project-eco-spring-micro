package kh.eco.istad.platform.authorization.domain.usecase.user;

import kh.eco.istad.platform.authorization.domain.dto.user.command.UpdateUserProfileCommand;
import kh.eco.istad.platform.authorization.domain.dto.role.result.RoleRef;
import kh.eco.istad.platform.authorization.domain.dto.user.result.UserResult;
import kh.eco.istad.platform.authorization.domain.port.out.CurrentActorProvider;
import kh.eco.istad.platform.authorization.domain.port.out.UserRepository;
import kh.eco.istad.platform.authorization.domain.usecase.shared.AuthorityResolver;
import kh.eco.istad.platform.authorization.domain.usecase.shared.Rules;
import kh.eco.istad.platform.authorization.domain.entity.user.User;
import kh.eco.istad.platform.authorization.domain.entity.user.UserProfile;
import kh.eco.istad.platform.authorization.domain.exception.PhoneNumberConflictException;

import java.time.Clock;
import java.time.Instant;
import java.util.UUID;
import kh.eco.istad.platform.authorization.domain.mapper.DomainDtoMapper;

public class UpdateUserProfileUseCase {

    private final UserRepository users;
    private final AuthorityResolver authorities;
    private final CurrentActorProvider actors;
    private final Clock clock;

    public UpdateUserProfileUseCase(UserRepository users, AuthorityResolver authorities,
                                    CurrentActorProvider actors, Clock clock) {
        this.users = users;
        this.authorities = authorities;
        this.actors = actors;
        this.clock = clock;
    }

    public UserResult execute(UUID userUuid, UpdateUserProfileCommand command) {
        User user = Rules.loadUser(users, userUuid);
        Instant now = clock.instant();
        UserProfile old = user.getProfile();
        UserProfile updated = new UserProfile(
                value(command.givenName(), old.givenName()), value(command.familyName(), old.familyName()),
                value(command.middleName(), old.middleName()), value(command.nickname(), old.nickname()),
                value(command.gender(), old.gender()), value(command.birthdate(), old.birthdate()),
                value(command.phoneNumber(), old.phoneNumber()), value(command.pictureUrl(), old.pictureUrl()),
                value(command.websiteUrl(), old.websiteUrl()), value(command.profileUrl(), old.profileUrl()),
                value(command.zoneinfo(), old.zoneinfo()), value(command.locale(), old.locale()),
                value(command.address(), old.address()));
        if (updated.phoneNumber() != null
                && users.existsByPhoneNumberForAnotherUser(updated.phoneNumber(), userUuid)) {
            throw new PhoneNumberConflictException();
        }
        user.updateProfile(updated, actors.currentActor(), now);
        users.save(user);
        return DomainDtoMapper.toUserResult(user, authorities.activeRoles(userUuid, now).stream()
                .map(role -> new RoleRef(role.getUuid(), role.getName())).toList());
    }

    private static <T> T value(T value, T fallback) {
        return value == null ? fallback : value;
    }
}
