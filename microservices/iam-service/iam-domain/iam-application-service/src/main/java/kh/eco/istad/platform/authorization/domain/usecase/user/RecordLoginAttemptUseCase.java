package kh.eco.istad.platform.authorization.domain.usecase.user;

import kh.eco.istad.platform.authorization.domain.port.out.UserRepository;
import kh.eco.istad.platform.authorization.domain.entity.user.User;

import java.time.Clock;
import java.time.Instant;

public class RecordLoginAttemptUseCase {

    private static final String SYSTEM_ACTOR = "system";

    private final UserRepository users;
    private final Clock clock;

    public RecordLoginAttemptUseCase(UserRepository users, Clock clock) {
        this.users = users;
        this.clock = clock;
    }

    public void execute(String usernameOrEmail, boolean success) {
        if (usernameOrEmail == null || usernameOrEmail.isBlank()) {
            return;
        }
        Instant now = clock.instant();
        users.findByUsernameOrEmail(usernameOrEmail.trim()).ifPresent(user -> {
            if (success) {
                user.recordSuccessfulLogin(SYSTEM_ACTOR, now);
            } else {
                user.recordFailedLogin(SYSTEM_ACTOR, now);
            }
            users.save(user);
        });
    }
}
