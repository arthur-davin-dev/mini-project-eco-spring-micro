package kh.eco.istad.platform.authorization.domain.usecase.user;

import kh.eco.istad.platform.authorization.domain.port.out.CurrentActorProvider;
import kh.eco.istad.platform.authorization.domain.port.out.UserRepository;
import kh.eco.istad.platform.authorization.domain.usecase.shared.Rules;
import kh.eco.istad.platform.authorization.domain.entity.user.User;

import java.time.Clock;
import java.util.UUID;

public class UnlockUserUseCase {

    private final UserRepository users;
    private final CurrentActorProvider actors;
    private final Clock clock;

    public UnlockUserUseCase(UserRepository users, CurrentActorProvider actors, Clock clock) {
        this.users = users;
        this.actors = actors;
        this.clock = clock;
    }

    public void execute(UUID userUuid) {
        User user = Rules.loadUser(users, userUuid);
        user.unlock(actors.currentActor(), clock.instant());
        users.save(user);
    }
}
