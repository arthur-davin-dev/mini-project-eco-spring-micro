package kh.eco.istad.platform.authorization.domain.usecase.role;

import kh.eco.istad.platform.authorization.domain.exception.NotFoundException;
import kh.eco.istad.platform.authorization.domain.port.out.CurrentActorProvider;
import kh.eco.istad.platform.authorization.domain.port.out.RoleRepository;
import kh.eco.istad.platform.authorization.domain.usecase.shared.Rules;
import kh.eco.istad.platform.authorization.domain.entity.assignment.RolePermission;

import java.time.Clock;
import java.time.Instant;
import java.util.UUID;

public class RevokePermissionFromRoleUseCase {

    private final RoleRepository roles;
    private final CurrentActorProvider actors;
    private final Clock clock;

    public RevokePermissionFromRoleUseCase(RoleRepository roles, CurrentActorProvider actors, Clock clock) {
        this.roles = roles;
        this.actors = actors;
        this.clock = clock;
    }

    public void execute(UUID roleUuid, UUID permissionUuid, String reason) {
        Rules.loadRole(roles, roleUuid);
        Instant now = clock.instant();
        RolePermission link = roles.findRolePermission(roleUuid, permissionUuid)
                .filter(candidate -> candidate.isActiveAt(now))
                .orElseThrow(() -> new NotFoundException("Permission is not attached to this role"));
        link.revoke(actors.currentActor(), reason, now);
        roles.saveRolePermission(link);
    }
}
