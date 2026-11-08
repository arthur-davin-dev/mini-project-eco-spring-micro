package kh.eco.istad.iam.rest.dto;

import kh.eco.istad.platform.authorization.domain.entity.assignment.PermissionEffect;
import kh.eco.istad.platform.authorization.domain.entity.user.IdentityProvider;
import kh.eco.istad.platform.authorization.domain.valueobject.PostalAddress;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.UUID;

public final class Responses {

    private Responses() {
    }

    public record RoleRef(UUID uuid, String name) {
    }

    public record UserResponse(
            UUID uuid,
            String username,
            String email,
            boolean emailVerified,
            String name,
            String locale,
            boolean enabled,
            List<RoleRef> roles,
            Instant createdAt,
            Instant updatedAt,
            String givenName,
            String familyName,
            String nickname,
            String gender,
            LocalDate birthdate,
            String phoneNumber,
            String zoneinfo,
            PostalAddress address,
            boolean accountNonLocked
    ) {
    }

    public record UserSummaryResponse(
            UUID uuid,
            String username,
            String email,
            String name,
            String locale,
            boolean enabled,
            boolean accountNonLocked,
            List<RoleRef> roles,
            Instant createdAt,
            Instant updatedAt
    ) {
    }

    public record UserAuthoritiesResponse(
            List<RoleAssignment> roles,
            List<DirectPermission> directPermissions,
            Set<String> effectivePermissions
    ) {
    }

    public record RoleAssignment(UUID uuid, String name, Instant expiresAt) {
    }

    public record DirectPermission(String name, PermissionEffect effect) {
    }

    public record IdentityResponse(
            UUID uuid,
            IdentityProvider provider,
            String email,
            String displayName,
            Instant linkedAt,
            Instant lastLoginAt
    ) {
    }

    public record PageResponse<T>(List<T> content, PageInfo page) {
    }

    public record PageInfo(int number, int size, long totalElements, int totalPages) {
    }

    public record RoleResponse(
            UUID uuid,
            String name,
            String description,
            boolean system,
            boolean active,
            List<String> permissions,
            Instant createdAt,
            Instant updatedAt
    ) {
    }

    public record RoleSummaryResponse(
            UUID uuid,
            String name,
            String description,
            boolean system,
            boolean active,
            List<String> permissions,
            Instant createdAt,
            Instant updatedAt
    ) {
    }

    public record PermissionResponse(
            UUID uuid,
            String name,
            String resource,
            String action,
            String description,
            boolean system,
            boolean active,
            Instant createdAt,
            Instant updatedAt
    ) {
    }

    public record RoleAssignmentResponse(UUID roleUuid, String roleName, Instant expiresAt) {
    }

    public record PermissionGrantResponse(
            UUID permissionUuid,
            String permissionName,
            PermissionEffect effect,
            Instant expiresAt
    ) {
    }

    public record PermissionAssignmentResponse(UUID permissionUuid, String permissionName, Instant expiresAt) {
    }
}
