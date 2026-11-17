package kh.eco.istad.platform.authorization.domain.usecase.identity;

import kh.eco.istad.platform.authorization.domain.dto.identity.command.FederatedIdentityCommand;
import kh.eco.istad.platform.authorization.domain.dto.identity.result.IdentityResult;
import kh.eco.istad.platform.authorization.domain.exception.ConflictException;
import kh.eco.istad.platform.authorization.domain.port.out.CurrentActorProvider;
import kh.eco.istad.platform.authorization.domain.port.out.UserRepository;
import kh.eco.istad.platform.authorization.domain.usecase.shared.Rules;
import kh.eco.istad.platform.authorization.domain.entity.user.Identity;
import kh.eco.istad.platform.authorization.domain.entity.user.User;

import java.time.Clock;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import kh.eco.istad.platform.authorization.domain.mapper.DomainDtoMapper;

public class LinkIdentityUseCase {

    private final UserRepository users;
    private final CurrentActorProvider actors;
    private final Clock clock;

    public LinkIdentityUseCase(UserRepository users, CurrentActorProvider actors, Clock clock) {
        this.users = users;
        this.actors = actors;
        this.clock = clock;
    }

    public IdentityResult execute(UUID userUuid, FederatedIdentityCommand command) {
        User user = Rules.loadUser(users, userUuid);
        Optional<User> existingOwner = users.findByIdentity(command.provider(), command.providerSubject());
        if (existingOwner.isPresent() && !existingOwner.get().getUuid().equals(userUuid)) {
            throw new ConflictException("This " + command.provider() + " account is already linked to another user");
        }
        String actor = actors.currentActor();
        Instant now = clock.instant();
        Identity identity = user.linkOrRelinkIdentity(command.provider(), command.providerSubject(),
                command.email(), command.emailVerified(), command.displayName(), command.username(),
                command.pictureUrl(), actor, now);
        users.save(user);
        return DomainDtoMapper.toIdentityResult(identity);
    }
}
