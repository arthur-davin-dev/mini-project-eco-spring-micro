package kh.eco.istad.platform.authorization.domain.usecase.user;

import kh.eco.istad.platform.authorization.domain.exception.NotFoundException;
import kh.eco.istad.platform.authorization.domain.port.out.CurrentActorProvider;
import kh.eco.istad.platform.authorization.domain.port.out.UserRepository;
import kh.eco.istad.platform.authorization.domain.usecase.shared.Rules;
import kh.eco.istad.platform.authorization.domain.entity.assignment.UserRole;

import java.time.Clock;
import java.time.Instant;
import java.util.UUID;

public class RevokeRoleFromUserUseCase {

    private final UserRepository users;
    private final CurrentActorProvider actors;
    private final Clock clock;

    public RevokeRoleFromUserUseCase(UserRepository users, CurrentActorProvider actors, Clock clock) {
        this.users = users;
        this.actors = actors;
        this.clock = clock;
    }

    public void execute(UUID userUuid, UUID roleUuid, String reason) {
        Rules.loadUser(users, userUuid);
        Instant now = clock.instant();
        UserRole link = users.findUserRole(userUuid, roleUuid)
                .filter(candidate -> candidate.isActiveAt(now))
                .orElseThrow(() -> new NotFoundException("Role is not assigned to this user"));
        link.revoke(actors.currentActor(), reason, now);
        users.saveUserRole(link);
    }
}
