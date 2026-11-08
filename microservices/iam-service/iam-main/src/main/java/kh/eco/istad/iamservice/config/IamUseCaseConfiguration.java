package kh.eco.istad.iamservice.config;

import kh.eco.istad.platform.authorization.domain.port.out.CurrentActorProvider;
import kh.eco.istad.platform.authorization.domain.port.out.PasswordHasher;
import kh.eco.istad.platform.authorization.domain.port.out.PermissionRepository;
import kh.eco.istad.platform.authorization.domain.port.out.RoleRepository;
import kh.eco.istad.platform.authorization.domain.port.out.UserRepository;
import kh.eco.istad.platform.authorization.domain.usecase.shared.AuthorityResolver;
import kh.eco.istad.platform.authorization.domain.usecase.identity.*;
import kh.eco.istad.platform.authorization.domain.usecase.permission.*;
import kh.eco.istad.platform.authorization.domain.usecase.role.*;
import kh.eco.istad.platform.authorization.domain.usecase.user.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Clock;

@Configuration
public class IamUseCaseConfiguration {

    @Bean
    Clock iamClock() {
        return Clock.systemUTC();
    }

    @Bean
    AuthorityResolver authorityResolver(UserRepository users, RoleRepository roles,
                                        PermissionRepository permissions) {
        return new AuthorityResolver(users, roles, permissions);
    }

    @Bean
    RegisterUserUseCase registerUserUseCase(UserRepository users, RoleRepository roles,
                                            PasswordHasher hasher, Clock iamClock) {
        return new RegisterUserUseCase(users, roles, hasher, iamClock);
    }

    @Bean
    CreateUserUseCase createUserUseCase(UserRepository users, RoleRepository roles,
                                        PasswordHasher hasher, CurrentActorProvider actors, Clock iamClock) {
        return new CreateUserUseCase(users, roles, hasher, actors, iamClock);
    }

    @Bean
    GetUserUseCase getUserUseCase(UserRepository users, AuthorityResolver authorities, Clock iamClock) {
        return new GetUserUseCase(users, authorities, iamClock);
    }

    @Bean
    ListUsersUseCase listUsersUseCase(UserRepository users, AuthorityResolver authorities, Clock iamClock) {
        return new ListUsersUseCase(users, authorities, iamClock);
    }

    @Bean
    UpdateUserProfileUseCase updateUserProfileUseCase(UserRepository users, AuthorityResolver authorities,
                                                      CurrentActorProvider actors, Clock iamClock) {
        return new UpdateUserProfileUseCase(users, authorities, actors, iamClock);
    }

    @Bean
    ChangePasswordUseCase changePasswordUseCase(UserRepository users, PasswordHasher hasher,
                                                CurrentActorProvider actors, Clock iamClock) {
        return new ChangePasswordUseCase(users, hasher, actors, iamClock);
    }

    @Bean
    ResetUserPasswordUseCase resetUserPasswordUseCase(UserRepository users, PasswordHasher hasher,
                                                      CurrentActorProvider actors, Clock iamClock) {
        return new ResetUserPasswordUseCase(users, hasher, actors, iamClock);
    }

    @Bean
    EnableUserUseCase enableUserUseCase(UserRepository users, CurrentActorProvider actors, Clock iamClock) {
        return new EnableUserUseCase(users, actors, iamClock);
    }

    @Bean
    DisableUserUseCase disableUserUseCase(UserRepository users, CurrentActorProvider actors, Clock iamClock) {
        return new DisableUserUseCase(users, actors, iamClock);
    }

    @Bean
    LockUserUseCase lockUserUseCase(UserRepository users, CurrentActorProvider actors, Clock iamClock) {
        return new LockUserUseCase(users, actors, iamClock);
    }

    @Bean
    UnlockUserUseCase unlockUserUseCase(UserRepository users, CurrentActorProvider actors, Clock iamClock) {
        return new UnlockUserUseCase(users, actors, iamClock);
    }

    @Bean
    DeleteUserUseCase deleteUserUseCase(UserRepository users, CurrentActorProvider actors, Clock iamClock) {
        return new DeleteUserUseCase(users, actors, iamClock);
    }

    @Bean
    AssignRolesToUserUseCase assignRolesToUserUseCase(UserRepository users, RoleRepository roles,
                                                      CurrentActorProvider actors, Clock iamClock) {
        return new AssignRolesToUserUseCase(users, roles, actors, iamClock);
    }

    @Bean
    RevokeRoleFromUserUseCase revokeRoleFromUserUseCase(UserRepository users,
                                                        CurrentActorProvider actors, Clock iamClock) {
        return new RevokeRoleFromUserUseCase(users, actors, iamClock);
    }

    @Bean
    GrantPermissionsToUserUseCase grantPermissionsToUserUseCase(UserRepository users,
                                                                PermissionRepository permissions, CurrentActorProvider actors, Clock iamClock) {
        return new GrantPermissionsToUserUseCase(users, permissions, actors, iamClock);
    }

    @Bean
    RevokePermissionFromUserUseCase revokePermissionFromUserUseCase(UserRepository users,
                                                                    CurrentActorProvider actors, Clock iamClock) {
        return new RevokePermissionFromUserUseCase(users, actors, iamClock);
    }

    @Bean
    GetUserAuthoritiesUseCase getUserAuthoritiesUseCase(UserRepository users,
                                                        AuthorityResolver authorities, Clock iamClock) {
        return new GetUserAuthoritiesUseCase(users, authorities, iamClock);
    }

    @Bean
    LoadUserForAuthenticationUseCase loadUserForAuthenticationUseCase(UserRepository users,
                                                                      AuthorityResolver authorities, Clock iamClock) {
        return new LoadUserForAuthenticationUseCase(users, authorities, iamClock);
    }

    @Bean
    RecordLoginAttemptUseCase recordLoginAttemptUseCase(UserRepository users, Clock iamClock) {
        return new RecordLoginAttemptUseCase(users, iamClock);
    }

    @Bean
    CreateRoleUseCase createRoleUseCase(RoleRepository roles, PermissionRepository permissions,
                                        AuthorityResolver authorities, CurrentActorProvider actors, Clock iamClock) {
        return new CreateRoleUseCase(roles, permissions, authorities, actors, iamClock);
    }

    @Bean
    GetRoleUseCase getRoleUseCase(RoleRepository roles, AuthorityResolver authorities, Clock iamClock) {
        return new GetRoleUseCase(roles, authorities, iamClock);
    }

    @Bean
    ListRolesUseCase listRolesUseCase(RoleRepository roles, AuthorityResolver authorities, Clock iamClock) {
        return new ListRolesUseCase(roles, authorities, iamClock);
    }

    @Bean
    UpdateRoleUseCase updateRoleUseCase(RoleRepository roles, AuthorityResolver authorities,
                                        CurrentActorProvider actors, Clock iamClock) {
        return new UpdateRoleUseCase(roles, authorities, actors, iamClock);
    }

    @Bean
    ActivateRoleUseCase activateRoleUseCase(RoleRepository roles, CurrentActorProvider actors, Clock iamClock) {
        return new ActivateRoleUseCase(roles, actors, iamClock);
    }

    @Bean
    DeactivateRoleUseCase deactivateRoleUseCase(RoleRepository roles,
                                                CurrentActorProvider actors, Clock iamClock) {
        return new DeactivateRoleUseCase(roles, actors, iamClock);
    }

    @Bean
    DeleteRoleUseCase deleteRoleUseCase(RoleRepository roles, CurrentActorProvider actors, Clock iamClock) {
        return new DeleteRoleUseCase(roles, actors, iamClock);
    }

    @Bean
    AssignPermissionsToRoleUseCase assignPermissionsToRoleUseCase(RoleRepository roles,
                                                                  PermissionRepository permissions, CurrentActorProvider actors, Clock iamClock) {
        return new AssignPermissionsToRoleUseCase(roles, permissions, actors, iamClock);
    }

    @Bean
    RevokePermissionFromRoleUseCase revokePermissionFromRoleUseCase(RoleRepository roles,
                                                                    CurrentActorProvider actors, Clock iamClock) {
        return new RevokePermissionFromRoleUseCase(roles, actors, iamClock);
    }

    @Bean
    CreatePermissionUseCase createPermissionUseCase(PermissionRepository permissions,
                                                    CurrentActorProvider actors, Clock iamClock) {
        return new CreatePermissionUseCase(permissions, actors, iamClock);
    }

    @Bean
    GetPermissionUseCase getPermissionUseCase(PermissionRepository permissions) {
        return new GetPermissionUseCase(permissions);
    }

    @Bean
    ListPermissionsUseCase listPermissionsUseCase(PermissionRepository permissions) {
        return new ListPermissionsUseCase(permissions);
    }

    @Bean
    UpdatePermissionUseCase updatePermissionUseCase(PermissionRepository permissions,
                                                    CurrentActorProvider actors, Clock iamClock) {
        return new UpdatePermissionUseCase(permissions, actors, iamClock);
    }

    @Bean
    ActivatePermissionUseCase activatePermissionUseCase(PermissionRepository permissions,
                                                        CurrentActorProvider actors, Clock iamClock) {
        return new ActivatePermissionUseCase(permissions, actors, iamClock);
    }

    @Bean
    DeactivatePermissionUseCase deactivatePermissionUseCase(PermissionRepository permissions,
                                                            CurrentActorProvider actors, Clock iamClock) {
        return new DeactivatePermissionUseCase(permissions, actors, iamClock);
    }

    @Bean
    DeletePermissionUseCase deletePermissionUseCase(PermissionRepository permissions,
                                                    CurrentActorProvider actors, Clock iamClock) {
        return new DeletePermissionUseCase(permissions, actors, iamClock);
    }

    @Bean
    FindOrProvisionFederatedUserUseCase findOrProvisionFederatedUserUseCase(UserRepository users,
                                                                            RoleRepository roles, AuthorityResolver authorities, Clock iamClock) {
        return new FindOrProvisionFederatedUserUseCase(users, roles, authorities, iamClock);
    }

    @Bean
    LinkIdentityUseCase linkIdentityUseCase(UserRepository users,
                                            CurrentActorProvider actors, Clock iamClock) {
        return new LinkIdentityUseCase(users, actors, iamClock);
    }

    @Bean
    ListUserIdentitiesUseCase listUserIdentitiesUseCase(UserRepository users) {
        return new ListUserIdentitiesUseCase(users);
    }

    @Bean
    UnlinkIdentityUseCase unlinkIdentityUseCase(UserRepository users,
                                                CurrentActorProvider actors, Clock iamClock) {
        return new UnlinkIdentityUseCase(users, actors, iamClock);
    }
}
