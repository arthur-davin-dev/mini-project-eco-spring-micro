package kh.eco.istad.platform.authorization.domain.usecase.role;

import kh.eco.istad.platform.authorization.domain.port.out.CurrentActorProvider;
import kh.eco.istad.platform.authorization.domain.port.out.RoleRepository;
import kh.eco.istad.platform.authorization.domain.usecase.shared.Rules;
import kh.eco.istad.platform.authorization.domain.entity.role.Role;

import java.time.Clock;
import java.util.UUID;

public class DeactivateRoleUseCase {

    private final RoleRepository roles;
    private final CurrentActorProvider actors;
    private final Clock clock;

    public DeactivateRoleUseCase(RoleRepository roles, CurrentActorProvider actors, Clock clock) {
        this.roles = roles;
        this.actors = actors;
        this.clock = clock;
    }

    public void execute(UUID roleUuid) {
        Role role = Rules.loadRole(roles, roleUuid);
        role.deactivate(actors.currentActor(), clock.instant());
        roles.save(role);
    }
}
