package kh.eco.istad.platform.authorization.domain.usecase.shared;

import kh.eco.istad.platform.authorization.domain.dto.user.result.RoleAssignmentResult;
import kh.eco.istad.platform.authorization.domain.dto.user.result.UserAuthoritiesResult;
import kh.eco.istad.platform.authorization.domain.dto.user.result.UserAuthoritiesResult.DirectPermission;
import kh.eco.istad.platform.authorization.domain.port.out.PermissionRepository;
import kh.eco.istad.platform.authorization.domain.port.out.RoleRepository;
import kh.eco.istad.platform.authorization.domain.port.out.UserRepository;
import kh.eco.istad.platform.authorization.domain.entity.assignment.PermissionEffect;
import kh.eco.istad.platform.authorization.domain.entity.assignment.RolePermission;
import kh.eco.istad.platform.authorization.domain.entity.assignment.UserPermission;
import kh.eco.istad.platform.authorization.domain.entity.assignment.UserRole;
import kh.eco.istad.platform.authorization.domain.entity.permission.Permission;
import kh.eco.istad.platform.authorization.domain.entity.role.Role;
import kh.eco.istad.platform.authorization.domain.service.EffectivePermissions;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

public class AuthorityResolver {

    private final UserRepository users;
    private final RoleRepository roles;
    private final PermissionRepository permissions;

    public AuthorityResolver(UserRepository users, RoleRepository roles, PermissionRepository permissions) {
        this.users = users;
        this.roles = roles;
        this.permissions = permissions;
    }

    public List<Role> activeRoles(UUID userUuid, Instant now) {
        Map<UUID, UserRole> links = activeRoleLinks(userUuid, now);
        if (links.isEmpty()) {
            return List.of();
        }
        return roles.findByUuids(links.keySet()).stream()
                .filter(Role::isAssignable)
                .toList();
    }

    public List<String> activeRoleNames(UUID userUuid, Instant now) {
        return activeRoles(userUuid, now).stream().map(Role::getName).toList();
    }

    public UserAuthoritiesResult resolve(UUID userUuid, Instant now) {
        Map<UUID, UserRole> roleLinks = activeRoleLinks(userUuid, now);
        List<Role> activeRoles = activeRoles(userUuid, now);

        List<RoleAssignmentResult> roleResults = activeRoles.stream()
                .map(role -> new RoleAssignmentResult(
                        role.getUuid(), role.getName(), roleLinks.get(role.getUuid()).getExpiresAt()))
                .toList();

        Set<String> fromRoles = rolePermissionNames(activeRoles, now);

        List<UserPermission> links = users.findUserPermissions(userUuid);
        Map<UUID, Permission> byUuid = permissionsByUuid(
                links.stream().map(UserPermission::getPermissionUuid).toList());

        List<DirectPermission> direct = new ArrayList<>();
        Set<String> grants = new HashSet<>();
        Set<String> denies = new HashSet<>();
        for (UserPermission link : links) {
            Permission permission = byUuid.get(link.getPermissionUuid());
            if (!link.isActiveAt(now) || permission == null || !permission.isAssignable()) {
                continue;
            }
            direct.add(new DirectPermission(permission.name(), link.getEffect()));
            if (link.getEffect() == PermissionEffect.GRANT) {
                grants.add(permission.name());
            } else {
                denies.add(permission.name());
            }
        }

        return new UserAuthoritiesResult(roleResults, direct,
                EffectivePermissions.calculate(fromRoles, grants, denies));
    }

    public List<String> authorities(UUID userUuid, Instant now) {
        UserAuthoritiesResult resolved = resolve(userUuid, now);
        List<String> authorities = new ArrayList<>();
        for (RoleAssignmentResult role : resolved.roles()) {
            authorities.add("ROLE_" + role.roleName());
        }
        authorities.addAll(resolved.effectivePermissions());
        return authorities;
    }

    public Set<String> rolePermissionNames(List<Role> activeRoles, Instant now) {
        List<UUID> permissionUuids = new ArrayList<>();
        for (Role role : activeRoles) {
            roles.findRolePermissions(role.getUuid()).stream()
                    .filter(link -> link.isActiveAt(now))
                    .map(RolePermission::getPermissionUuid)
                    .forEach(permissionUuids::add);
        }
        Map<UUID, Permission> byUuid = permissionsByUuid(permissionUuids);
        return permissionUuids.stream()
                .map(byUuid::get)
                .filter(permission -> permission != null && permission.isAssignable())
                .map(Permission::name)
                .collect(Collectors.toSet());
    }

    private Map<UUID, UserRole> activeRoleLinks(UUID userUuid, Instant now) {
        Map<UUID, UserRole> links = new LinkedHashMap<>();
        for (UserRole link : users.findUserRoles(userUuid)) {
            if (link.isActiveAt(now)) {
                links.put(link.getRoleUuid(), link);
            }
        }
        return links;
    }

    private Map<UUID, Permission> permissionsByUuid(List<UUID> uuids) {
        if (uuids.isEmpty()) {
            return Map.of();
        }
        return permissions.findByUuids(uuids).stream()
                .collect(Collectors.toMap(Permission::getUuid, permission -> permission, (a, b) -> a));
    }
}
