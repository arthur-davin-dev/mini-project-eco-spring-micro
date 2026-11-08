package kh.eco.istad.platform.authorization.domain.usecase.user;

import kh.eco.istad.platform.authorization.domain.dto.user.command.AssignRolesToUserCommand;
import kh.eco.istad.platform.authorization.domain.dto.user.result.RoleAssignmentResult;
import kh.eco.istad.platform.authorization.domain.exception.ConflictException;
import kh.eco.istad.platform.authorization.domain.port.out.CurrentActorProvider;
import kh.eco.istad.platform.authorization.domain.port.out.RoleRepository;
import kh.eco.istad.platform.authorization.domain.port.out.UserRepository;
import kh.eco.istad.platform.authorization.domain.usecase.shared.Rules;
import kh.eco.istad.platform.authorization.domain.entity.assignment.UserRole;
import kh.eco.istad.platform.authorization.domain.entity.role.Role;
import kh.eco.istad.platform.authorization.domain.entity.user.User;

import java.time.Clock;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class AssignRolesToUserUseCase {

    private final UserRepository users;
    private final RoleRepository roles;
    private final CurrentActorProvider actors;
    private final Clock clock;

    public AssignRolesToUserUseCase(UserRepository users, RoleRepository roles,
                                    CurrentActorProvider actors, Clock clock) {
        this.users = users;
        this.roles = roles;
        this.actors = actors;
        this.clock = clock;
    }

    public List<RoleAssignmentResult> execute(UUID userUuid, AssignRolesToUserCommand command) {
        User user = Rules.loadUser(users, userUuid);
        String actor = actors.currentActor();
        Instant now = clock.instant();

        List<RoleAssignmentResult> results = new ArrayList<>();
        for (UUID roleUuid : command.roleUuids().stream().distinct().toList()) {
            Role role = Rules.loadRole(roles, roleUuid);
            boolean alreadyActive = users.findUserRole(user.getUuid(), roleUuid)
                    .filter(link -> link.isActiveAt(now))
                    .isPresent();
            if (alreadyActive) {
                throw new ConflictException("Role '" + role.getName() + "' is already assigned to this user");
            }
            users.saveUserRole(UserRole.assign(user.getUuid(), role, command.expiresAt(), actor,
                    command.reason(), now));
            results.add(new RoleAssignmentResult(role.getUuid(), role.getName(), command.expiresAt()));
        }
        return results;
    }
}
