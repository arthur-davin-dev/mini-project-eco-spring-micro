package kh.eco.istad.iam.rest.controller;

import jakarta.validation.Valid;
import kh.eco.istad.platform.authorization.domain.dto.common.PageRequest;
import kh.eco.istad.platform.authorization.domain.dto.user.command.UserFilterQuery;
import kh.eco.istad.iam.rest.dto.Responses.UserSummaryResponse;
import kh.eco.istad.platform.authorization.domain.usecase.identity.ListUserIdentitiesUseCase;
import kh.eco.istad.platform.authorization.domain.usecase.identity.UnlinkIdentityUseCase;
import kh.eco.istad.platform.authorization.domain.usecase.user.AssignRolesToUserUseCase;
import kh.eco.istad.platform.authorization.domain.usecase.user.CreateUserUseCase;
import kh.eco.istad.platform.authorization.domain.usecase.user.DeleteUserUseCase;
import kh.eco.istad.platform.authorization.domain.usecase.user.DisableUserUseCase;
import kh.eco.istad.platform.authorization.domain.usecase.user.EnableUserUseCase;
import kh.eco.istad.platform.authorization.domain.usecase.user.GetUserAuthoritiesUseCase;
import kh.eco.istad.platform.authorization.domain.usecase.user.GetUserUseCase;
import kh.eco.istad.platform.authorization.domain.usecase.user.GrantPermissionsToUserUseCase;
import kh.eco.istad.platform.authorization.domain.usecase.user.ListUsersUseCase;
import kh.eco.istad.platform.authorization.domain.usecase.user.LockUserUseCase;
import kh.eco.istad.platform.authorization.domain.usecase.user.ResetUserPasswordUseCase;
import kh.eco.istad.platform.authorization.domain.usecase.user.RevokePermissionFromUserUseCase;
import kh.eco.istad.platform.authorization.domain.usecase.user.RevokeRoleFromUserUseCase;
import kh.eco.istad.platform.authorization.domain.usecase.user.UnlockUserUseCase;
import kh.eco.istad.platform.authorization.domain.usecase.user.UpdateUserProfileUseCase;
import kh.eco.istad.iam.rest.dto.Responses.IdentityResponse;
import kh.eco.istad.iam.rest.dto.Responses.PageResponse;
import kh.eco.istad.iam.rest.dto.Responses.PermissionGrantResponse;
import kh.eco.istad.iam.rest.dto.Responses.RoleAssignmentResponse;
import kh.eco.istad.iam.rest.dto.Responses.UserAuthoritiesResponse;
import kh.eco.istad.iam.rest.dto.Responses.UserResponse;
import kh.eco.istad.iam.rest.dto.UserRequests.AssignRolesToUserRequest;
import kh.eco.istad.iam.rest.dto.UserRequests.CreateUserRequest;
import kh.eco.istad.iam.rest.dto.UserRequests.GrantPermissionsToUserRequest;
import kh.eco.istad.iam.rest.dto.UserRequests.ResetUserPasswordRequest;
import kh.eco.istad.iam.rest.dto.UserRequests.UpdateUserProfileRequest;
import kh.eco.istad.iam.rest.mapper.RestMapper;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final CreateUserUseCase createUser;
    private final ListUsersUseCase listUsers;
    private final GetUserUseCase getUser;
    private final UpdateUserProfileUseCase updateProfile;
    private final DeleteUserUseCase deleteUser;
    private final EnableUserUseCase enableUser;
    private final DisableUserUseCase disableUser;
    private final LockUserUseCase lockUser;
    private final UnlockUserUseCase unlockUser;
    private final ResetUserPasswordUseCase resetPassword;
    private final GetUserAuthoritiesUseCase getAuthorities;
    private final AssignRolesToUserUseCase assignRoles;
    private final RevokeRoleFromUserUseCase revokeRole;
    private final GrantPermissionsToUserUseCase grantPermissions;
    private final RevokePermissionFromUserUseCase revokePermission;
    private final ListUserIdentitiesUseCase listIdentities;
    private final UnlinkIdentityUseCase unlinkIdentity;

    public UserController(CreateUserUseCase createUser, ListUsersUseCase listUsers, GetUserUseCase getUser,
                          UpdateUserProfileUseCase updateProfile, DeleteUserUseCase deleteUser,
                          EnableUserUseCase enableUser, DisableUserUseCase disableUser,
                          LockUserUseCase lockUser, UnlockUserUseCase unlockUser,
                          ResetUserPasswordUseCase resetPassword, GetUserAuthoritiesUseCase getAuthorities,
                          AssignRolesToUserUseCase assignRoles, RevokeRoleFromUserUseCase revokeRole,
                          GrantPermissionsToUserUseCase grantPermissions,
                          RevokePermissionFromUserUseCase revokePermission,
                          ListUserIdentitiesUseCase listIdentities, UnlinkIdentityUseCase unlinkIdentity) {
        this.createUser = createUser;
        this.listUsers = listUsers;
        this.getUser = getUser;
        this.updateProfile = updateProfile;
        this.deleteUser = deleteUser;
        this.enableUser = enableUser;
        this.disableUser = disableUser;
        this.lockUser = lockUser;
        this.unlockUser = unlockUser;
        this.resetPassword = resetPassword;
        this.getAuthorities = getAuthorities;
        this.assignRoles = assignRoles;
        this.revokeRole = revokeRole;
        this.grantPermissions = grantPermissions;
        this.revokePermission = revokePermission;
        this.listIdentities = listIdentities;
        this.unlinkIdentity = unlinkIdentity;
    }

    @PostMapping
    @PreAuthorize("hasAuthority('user:create')")
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse create(@Valid @RequestBody CreateUserRequest request) {
        return RestMapper.toResponse(createUser.execute(RestMapper.toCommand(request)));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('user:read')")
    public PageResponse<UserSummaryResponse> list(
            @RequestParam(name = "keyword", required = false) String keyword,
            @RequestParam(name = "enabled", required = false) Boolean enabled,
            @RequestParam(name = "locked", required = false) Boolean locked,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size,
            @RequestParam(name = "sort", required = false) String sort) {
        return RestMapper.toPage(
                listUsers.execute(new UserFilterQuery(keyword, enabled, locked), new PageRequest(page, size, sort)),
                RestMapper::toResponse);
    }

    @GetMapping("/{uuid}")
    @PreAuthorize("hasAuthority('user:read')")
    public UserResponse get(@PathVariable("uuid") UUID uuid) {
        return RestMapper.toResponse(getUser.execute(uuid));
    }

    @PatchMapping("/{uuid}")
    @PreAuthorize("hasAuthority('user:update')")
    public UserResponse update(@PathVariable("uuid") UUID uuid, @Valid @RequestBody UpdateUserProfileRequest request) {
        return RestMapper.toResponse(updateProfile.execute(uuid, RestMapper.toCommand(request)));
    }

    @DeleteMapping("/{uuid}")
    @PreAuthorize("hasAuthority('user:delete')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable("uuid") UUID uuid) {
        deleteUser.execute(uuid);
    }

    @PostMapping("/{uuid}/enable")
    @PreAuthorize("hasAuthority('user:update')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void enable(@PathVariable("uuid") UUID uuid) {
        enableUser.execute(uuid);
    }

    @PostMapping("/{uuid}/disable")
    @PreAuthorize("hasAuthority('user:update')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void disable(@PathVariable("uuid") UUID uuid) {
        disableUser.execute(uuid);
    }

    @PostMapping("/{uuid}/lock")
    @PreAuthorize("hasAuthority('user:update')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void lock(@PathVariable("uuid") UUID uuid) {
        lockUser.execute(uuid);
    }

    @PostMapping("/{uuid}/unlock")
    @PreAuthorize("hasAuthority('user:update')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void unlock(@PathVariable("uuid") UUID uuid) {
        unlockUser.execute(uuid);
    }

    @PutMapping("/{uuid}/password")
    @PreAuthorize("hasAuthority('user:update')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void resetPassword(@PathVariable("uuid") UUID uuid, @Valid @RequestBody ResetUserPasswordRequest request) {
        resetPassword.execute(uuid, new kh.eco.istad.platform.authorization.domain.dto.user.command.ResetUserPasswordCommand(
                request.newPassword(), request.confirmPassword()));
    }

    @GetMapping("/{uuid}/authorities")
    @PreAuthorize("hasAuthority('user:read')")
    public UserAuthoritiesResponse authorities(@PathVariable("uuid") UUID uuid) {
        return RestMapper.toResponse(getAuthorities.execute(uuid));
    }

    @PostMapping("/{uuid}/roles")
    @PreAuthorize("hasAuthority('user:assign')")
    @ResponseStatus(HttpStatus.CREATED)
    public List<RoleAssignmentResponse> assignRoles(@PathVariable("uuid") UUID uuid,
                                                    @Valid @RequestBody AssignRolesToUserRequest request) {
        return assignRoles.execute(uuid, new kh.eco.istad.platform.authorization.domain.dto.user.command.AssignRolesToUserCommand(
                        request.roleUuids(), request.expiresAt(), request.reason()))
                .stream().map(RestMapper::toResponse).toList();
    }

    @DeleteMapping("/{uuid}/roles/{roleUuid}")
    @PreAuthorize("hasAuthority('user:assign')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void revokeRole(@PathVariable("uuid") UUID uuid, @PathVariable("roleUuid") UUID roleUuid,
                           @RequestParam(name = "reason", required = false) String reason) {
        revokeRole.execute(uuid, roleUuid, reason);
    }

    @PostMapping("/{uuid}/permissions")
    @PreAuthorize("hasAuthority('user:assign')")
    @ResponseStatus(HttpStatus.CREATED)
    public List<PermissionGrantResponse> grantPermissions(@PathVariable("uuid") UUID uuid,
                                                          @Valid @RequestBody GrantPermissionsToUserRequest request) {
        return grantPermissions.execute(uuid, new kh.eco.istad.platform.authorization.domain.dto.user.command.GrantPermissionsToUserCommand(
                        request.permissionUuids(), request.effect(), request.expiresAt(), request.reason()))
                .stream().map(RestMapper::toResponse).toList();
    }

    @DeleteMapping("/{uuid}/permissions/{permissionUuid}")
    @PreAuthorize("hasAuthority('user:assign')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void revokePermission(@PathVariable("uuid") UUID uuid, @PathVariable("permissionUuid") UUID permissionUuid,
                                 @RequestParam(name = "reason", required = false) String reason) {
        revokePermission.execute(uuid, permissionUuid, reason);
    }

    @GetMapping("/{uuid}/identities")
    @PreAuthorize("hasAuthority('user:read')")
    public List<IdentityResponse> identities(@PathVariable("uuid") UUID uuid) {
        return listIdentities.execute(uuid).stream().map(RestMapper::toResponse).toList();
    }

    @DeleteMapping("/{uuid}/identities/{identityUuid}")
    @PreAuthorize("hasAuthority('user:update')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void unlinkIdentity(@PathVariable("uuid") UUID uuid, @PathVariable("identityUuid") UUID identityUuid) {
        unlinkIdentity.execute(uuid, identityUuid);
    }
}
