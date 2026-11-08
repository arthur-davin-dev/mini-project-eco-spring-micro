package kh.eco.istad.platform.authorization.domain.dto.user.result;

import kh.eco.istad.platform.authorization.domain.entity.assignment.PermissionEffect;

import java.util.List;
import java.util.Set;

public record UserAuthoritiesResult(
        List<RoleAssignmentResult> roles,
        List<DirectPermission> directPermissions,
        Set<String> effectivePermissions
) {
    public UserAuthoritiesResult {
        roles = List.copyOf(roles);
        directPermissions = List.copyOf(directPermissions);
        effectivePermissions = Set.copyOf(effectivePermissions);
    }

    public record DirectPermission(String name, PermissionEffect effect) {
    }
}
