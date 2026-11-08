package kh.eco.istad.platform.authorization.domain.usecase.identity;

import kh.eco.istad.platform.authorization.domain.port.out.CurrentActorProvider;
import kh.eco.istad.platform.authorization.domain.port.out.UserRepository;
import kh.eco.istad.platform.authorization.domain.usecase.shared.Rules;
import kh.eco.istad.platform.authorization.domain.entity.user.User;

import java.time.Clock;
import java.util.UUID;

public class UnlinkIdentityUseCase {

    private final UserRepository users;
    private final CurrentActorProvider actors;
    private final Clock clock;

    public UnlinkIdentityUseCase(UserRepository users, CurrentActorProvider actors, Clock clock) {
        this.users = users;
        this.actors = actors;
        this.clock = clock;
    }

    public void execute(UUID userUuid, UUID identityUuid) {
        User user = Rules.loadUser(users, userUuid);
        user.unlinkIdentity(identityUuid, actors.currentActor(), clock.instant());
        users.save(user);
    }
}
