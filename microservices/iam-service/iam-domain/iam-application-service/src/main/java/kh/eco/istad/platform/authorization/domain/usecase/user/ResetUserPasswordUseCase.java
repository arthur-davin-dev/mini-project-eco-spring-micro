package kh.eco.istad.platform.authorization.domain.usecase.user;

import kh.eco.istad.platform.authorization.domain.dto.user.command.ResetUserPasswordCommand;
import kh.eco.istad.platform.authorization.domain.port.out.CurrentActorProvider;
import kh.eco.istad.platform.authorization.domain.port.out.PasswordHasher;
import kh.eco.istad.platform.authorization.domain.port.out.UserRepository;
import kh.eco.istad.platform.authorization.domain.usecase.shared.Rules;
import kh.eco.istad.platform.authorization.domain.entity.user.User;

import java.time.Clock;
import java.util.UUID;

public class ResetUserPasswordUseCase {

    private final UserRepository users;
    private final PasswordHasher hasher;
    private final CurrentActorProvider actors;
    private final Clock clock;

    public ResetUserPasswordUseCase(UserRepository users, PasswordHasher hasher,
                                    CurrentActorProvider actors, Clock clock) {
        this.users = users;
        this.hasher = hasher;
        this.actors = actors;
        this.clock = clock;
    }

    public void execute(UUID userUuid, ResetUserPasswordCommand command) {
        Rules.checkNewPassword(command.newPassword(), command.confirmPassword());
        User user = Rules.loadUser(users, userUuid);
        user.changePassword(hasher.hash(command.newPassword()), actors.currentActor(), clock.instant());
        users.save(user);
    }
}
