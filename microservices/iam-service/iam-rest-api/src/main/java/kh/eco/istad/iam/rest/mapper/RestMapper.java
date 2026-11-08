package kh.eco.istad.iam.rest.mapper;

import kh.eco.istad.platform.authorization.domain.dto.user.command.CreateUserCommand;
import kh.eco.istad.platform.authorization.domain.dto.identity.result.IdentityResult;
import kh.eco.istad.platform.authorization.domain.dto.common.PageResult;
import kh.eco.istad.platform.authorization.domain.dto.user.result.PermissionGrantResult;
import kh.eco.istad.platform.authorization.domain.dto.permission.result.PermissionAssignmentResult;
import kh.eco.istad.platform.authorization.domain.dto.permission.result.PermissionResult;
import kh.eco.istad.platform.authorization.domain.dto.user.command.UserProfileCommand;
import kh.eco.istad.platform.authorization.domain.dto.user.command.RegisterUserCommand;
import kh.eco.istad.platform.authorization.domain.dto.user.result.RoleAssignmentResult;
import kh.eco.istad.platform.authorization.domain.dto.role.result.RoleResult;
import kh.eco.istad.platform.authorization.domain.dto.user.command.UpdateUserProfileCommand;
import kh.eco.istad.platform.authorization.domain.dto.user.result.UserAuthoritiesResult;
import kh.eco.istad.platform.authorization.domain.dto.user.result.UserResult;
import kh.eco.istad.platform.authorization.domain.dto.user.result.UserSummary;
import kh.eco.istad.platform.authorization.domain.dto.role.result.RoleSummary;
import kh.eco.istad.iam.rest.dto.PermissionRequests.CreatePermissionRequest;
import kh.eco.istad.iam.rest.dto.PermissionRequests.UpdatePermissionRequest;
import kh.eco.istad.iam.rest.dto.Responses.DirectPermission;
import kh.eco.istad.iam.rest.dto.Responses.IdentityResponse;
import kh.eco.istad.iam.rest.dto.Responses.PageInfo;
import kh.eco.istad.iam.rest.dto.Responses.PageResponse;
import kh.eco.istad.iam.rest.dto.Responses.PermissionAssignmentResponse;
import kh.eco.istad.iam.rest.dto.Responses.PermissionGrantResponse;
import kh.eco.istad.iam.rest.dto.Responses.PermissionResponse;
import kh.eco.istad.iam.rest.dto.Responses.RoleAssignment;
import kh.eco.istad.iam.rest.dto.Responses.RoleAssignmentResponse;
import kh.eco.istad.iam.rest.dto.Responses.RoleRef;
import kh.eco.istad.iam.rest.dto.Responses.RoleResponse;
import kh.eco.istad.iam.rest.dto.Responses.UserAuthoritiesResponse;
import kh.eco.istad.iam.rest.dto.Responses.UserResponse;
import kh.eco.istad.iam.rest.dto.Responses.UserSummaryResponse;
import kh.eco.istad.iam.rest.dto.Responses.RoleSummaryResponse;
import kh.eco.istad.iam.rest.dto.RoleRequests.CreateRoleRequest;
import kh.eco.istad.iam.rest.dto.RoleRequests.UpdateRoleRequest;
import kh.eco.istad.iam.rest.dto.UserRequests.AddressRequest;
import kh.eco.istad.iam.rest.dto.UserRequests.ChangePasswordRequest;
import kh.eco.istad.iam.rest.dto.UserRequests.CreateUserRequest;
import kh.eco.istad.iam.rest.dto.UserRequests.RegisterUserRequest;
import kh.eco.istad.iam.rest.dto.UserRequests.UpdateUserProfileRequest;
import kh.eco.istad.platform.authorization.domain.dto.user.command.ChangePasswordCommand;
import kh.eco.istad.platform.authorization.domain.dto.permission.command.CreatePermissionCommand;
import kh.eco.istad.platform.authorization.domain.dto.role.command.CreateRoleCommand;
import kh.eco.istad.platform.authorization.domain.dto.permission.command.UpdatePermissionCommand;
import kh.eco.istad.platform.authorization.domain.dto.role.command.UpdateRoleCommand;
import kh.eco.istad.platform.authorization.domain.valueobject.PostalAddress;

import java.util.List;
import java.util.function.Function;

public final class RestMapper {

    private RestMapper() {
    }

    //requests -> commands

    public static RegisterUserCommand toCommand(RegisterUserRequest r) {
        return new RegisterUserCommand(
                r.username(),
                r.email(),
                r.password(),
                r.confirmPassword(),
                r.givenName(),
                r.familyName(),
                r.locale());
    }

    public static CreateUserCommand toCommand(CreateUserRequest r) {
        UserProfileCommand profile = new UserProfileCommand(
                r.givenName(), r.familyName(), null, null, r.gender(),
                r.birthdate(), r.phoneNumber(), null, null, null, r.zoneinfo(), r.locale(),
                toAddress(r.address()));
        return new CreateUserCommand(r.username(), r.email(), r.password(), r.confirmPassword(), profile,
                r.roleUuids());
    }

    public static UpdateUserProfileCommand toCommand(UpdateUserProfileRequest r) {
        return new UpdateUserProfileCommand(
                r.givenName(), null, null, r.nickname(), null, null,
                r.phoneNumber(), null, null, null, null, r.locale(), null);
    }

    public static ChangePasswordCommand toCommand(ChangePasswordRequest r) {
        return new ChangePasswordCommand(
                r.currentPassword(), r.newPassword(), r.confirmPassword());
    }

    public static CreateRoleCommand toCommand(CreateRoleRequest r) {
        return new CreateRoleCommand(r.name(), r.description(), r.permissionUuids());
    }

    public static UpdateRoleCommand toCommand(UpdateRoleRequest r) {
        return new UpdateRoleCommand(r.description());
    }

    public static CreatePermissionCommand toCommand(CreatePermissionRequest r) {
        return new CreatePermissionCommand(r.resource(), r.action(), r.description());
    }

    public static UpdatePermissionCommand toCommand(UpdatePermissionRequest r) {
        return new UpdatePermissionCommand(r.description());
    }

    static PostalAddress toAddress(AddressRequest a) {
        if (a == null) {
            return null;
        }
        return new PostalAddress(a.streetAddress(), a.locality(), a.region(), a.postalCode(), a.country());
    }

    // results -> responses

    public static UserResponse toResponse(UserResult u) {
        return new UserResponse(
                u.uuid(), u.username(), u.email(), u.emailVerified(), u.name(), u.locale(), u.enabled(),
                u.roles().stream()
                        .map(role -> new RoleRef(role.uuid(), role.name()))
                        .toList(),
                u.createdAt(), u.updatedAt(),
                u.givenName(), u.familyName(), u.nickname(), u.gender(), u.birthdate(), u.phoneNumber(),
                u.zoneinfo(), u.address(), u.accountNonLocked());
    }

    public static UserSummaryResponse toResponse(UserSummary u) {
        return new UserSummaryResponse(u.uuid(), u.username(), u.email(), u.name(), u.locale(),
                u.enabled(), u.accountNonLocked(), u.roles().stream()
                .map(role -> new RoleRef(role.uuid(), role.name())).toList(), u.createdAt(), u.updatedAt());
    }

    public static UserAuthoritiesResponse toResponse(UserAuthoritiesResult a) {
        return new UserAuthoritiesResponse(
                a.roles().stream().map(RestMapper::toRoleAssignment).toList(),
                a.directPermissions().stream()
                        .map(d -> new DirectPermission(d.name(), d.effect()))
                        .toList(),
                a.effectivePermissions());
    }

    static RoleAssignment toRoleAssignment(RoleAssignmentResult r) {
        return new RoleAssignment(r.roleUuid(), r.roleName(), r.expiresAt());
    }

    public static IdentityResponse toResponse(IdentityResult i) {
        return new IdentityResponse(i.uuid(), i.provider(), i.email(), i.displayName(), i.linkedAt(),
                i.lastLoginAt());
    }

    public static RoleResponse toResponse(RoleResult r) {
        return new RoleResponse(r.uuid(), r.name(), r.description(), r.system(), r.active(),
                r.permissions(), r.createdAt(), r.updatedAt());
    }

    public static RoleSummaryResponse toResponse(RoleSummary r) {
        return new RoleSummaryResponse(r.uuid(), r.name(), r.description(), r.system(), r.active(),
                r.permissions(), r.createdAt(), r.updatedAt());
    }

    public static PermissionResponse toResponse(PermissionResult p) {
        return new PermissionResponse(p.uuid(), p.name(), p.resource(), p.action(), p.description(),
                p.system(), p.active(), p.createdAt(), p.updatedAt());
    }

    public static RoleAssignmentResponse toResponse(RoleAssignmentResult r) {
        return new RoleAssignmentResponse(r.roleUuid(), r.roleName(), r.expiresAt());
    }

    public static PermissionGrantResponse toResponse(PermissionGrantResult g) {
        return new PermissionGrantResponse(g.permissionUuid(), g.permissionName(), g.effect(), g.expiresAt());
    }

    public static PermissionAssignmentResponse toResponse(PermissionAssignmentResult p) {
        return new PermissionAssignmentResponse(p.permissionUuid(), p.permissionName(), p.expiresAt());
    }

    public static <A, R> PageResponse<R> toPage(PageResult<A> page, Function<A, R> mapper) {
        List<R> content = page.content().stream().map(mapper).toList();
        return new PageResponse<>(content,
                new PageInfo(page.page(), page.size(), page.totalElements(), page.totalPages()));
    }
}
