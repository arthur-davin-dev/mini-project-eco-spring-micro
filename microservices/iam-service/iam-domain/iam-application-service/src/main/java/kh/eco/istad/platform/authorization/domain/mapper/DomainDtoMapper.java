package kh.eco.istad.platform.authorization.domain.mapper;

import kh.eco.istad.platform.authorization.domain.dto.identity.result.IdentityResult;
import kh.eco.istad.platform.authorization.domain.dto.permission.result.PermissionResult;
import kh.eco.istad.platform.authorization.domain.dto.role.result.RoleRef;
import kh.eco.istad.platform.authorization.domain.dto.role.result.RoleResult;
import kh.eco.istad.platform.authorization.domain.dto.role.result.RoleSummary;
import kh.eco.istad.platform.authorization.domain.dto.user.result.UserResult;
import kh.eco.istad.platform.authorization.domain.dto.user.result.UserSummary;
import kh.eco.istad.platform.authorization.domain.entity.permission.Permission;
import kh.eco.istad.platform.authorization.domain.entity.role.Role;
import kh.eco.istad.platform.authorization.domain.entity.user.Identity;
import kh.eco.istad.platform.authorization.domain.entity.user.User;
import kh.eco.istad.platform.authorization.domain.entity.user.UserProfile;

import java.util.List;

/** Maps framework-free domain objects to application results. */
public final class DomainDtoMapper {

    private DomainDtoMapper() {
    }

    public static UserResult toUserResult(User user, List<RoleRef> roles) {
        UserProfile profile = user.getProfile();
        return new UserResult(
                user.getUuid(),
                user.getUsername().value(),
                user.getEmail().value(),
                user.isEmailVerified(),
                profile.fullName(),
                profile.givenName(),
                profile.familyName(),
                profile.middleName(),
                profile.nickname(),
                profile.gender(),
                profile.birthdate(),
                profile.phoneNumber(),
                profile.pictureUrl(),
                profile.websiteUrl(),
                profile.profileUrl(),
                profile.zoneinfo(),
                profile.locale(),
                profile.address(),
                user.isEnabled(),
                user.isAccountNonLocked(),
                roles,
                user.getCreatedAt(),
                user.getUpdatedAt());
    }

    public static UserSummary toUserSummary(User user, List<RoleRef> roles) {
        UserProfile profile = user.getProfile();
        return new UserSummary(user.getUuid(), user.getUsername().value(), user.getEmail().value(),
                profile.fullName(), profile.locale(), user.isEnabled(), user.isAccountNonLocked(), roles,
                user.getCreatedAt(), user.getUpdatedAt());
    }

    public static RoleResult toRoleResult(Role role, List<String> permissionNames) {
        return new RoleResult(role.getUuid(), role.getName(), role.getDescription(), role.isSystem(),
                role.isActive(), permissionNames, role.getCreatedAt(), role.getUpdatedAt());
    }

    public static RoleSummary toRoleSummary(Role role, List<String> permissionNames) {
        return new RoleSummary(role.getUuid(), role.getName(), role.getDescription(), role.isSystem(),
                role.isActive(), permissionNames, role.getCreatedAt(), role.getUpdatedAt());
    }

    public static PermissionResult toPermissionResult(Permission permission) {
        return new PermissionResult(permission.getUuid(), permission.name(), permission.getResource(),
                permission.getAction(), permission.getDescription(), permission.isSystem(), permission.isActive(),
                permission.getCreatedAt(), permission.getUpdatedAt());
    }

    public static IdentityResult toIdentityResult(Identity identity) {
        return new IdentityResult(identity.getUuid(), identity.getProvider(), identity.getEmail(),
                identity.getDisplayName(), identity.getLinkedAt(), identity.getLastLoginAt());
    }
}
