package kh.eco.istad.platform.authorization.domain.usecase.user;

import kh.eco.istad.platform.authorization.domain.exception.NotFoundException;
import kh.eco.istad.platform.authorization.domain.port.out.CurrentActorProvider;
import kh.eco.istad.platform.authorization.domain.port.out.UserRepository;
import kh.eco.istad.platform.authorization.domain.usecase.shared.Rules;
import kh.eco.istad.platform.authorization.domain.entity.assignment.UserPermission;

import java.time.Clock;
import java.time.Instant;
import java.util.UUID;

public class RevokePermissionFromUserUseCase {

    private final UserRepository users;
    private final CurrentActorProvider actors;
    private final Clock clock;

    public RevokePermissionFromUserUseCase(UserRepository users, CurrentActorProvider actors, Clock clock) {
        this.users = users;
        this.actors = actors;
        this.clock = clock;
    }

    public void execute(UUID userUuid, UUID permissionUuid, String reason) {
        Rules.loadUser(users, userUuid);
        Instant now = clock.instant();
        UserPermission link = users.findUserPermission(userUuid, permissionUuid)
                .filter(candidate -> candidate.isActiveAt(now))
                .orElseThrow(() -> new NotFoundException("Permission entry not found for this user"));
        link.revoke(actors.currentActor(), reason, now);
        users.saveUserPermission(link);
    }
}
