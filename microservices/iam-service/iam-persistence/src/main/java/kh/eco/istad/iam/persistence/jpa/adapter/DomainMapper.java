package kh.eco.istad.iam.persistence.jpa.adapter;

import kh.eco.istad.platform.authorization.domain.entity.AuditableEntity;
import kh.eco.istad.platform.authorization.domain.entity.assignment.PermissionEffect;
import kh.eco.istad.platform.authorization.domain.entity.assignment.RolePermission;
import kh.eco.istad.platform.authorization.domain.entity.assignment.UserPermission;
import kh.eco.istad.platform.authorization.domain.entity.assignment.UserRole;
import kh.eco.istad.platform.authorization.domain.entity.permission.Permission;
import kh.eco.istad.platform.authorization.domain.entity.role.Role;
import kh.eco.istad.platform.authorization.domain.entity.user.Identity;
import kh.eco.istad.platform.authorization.domain.entity.user.IdentityProvider;
import kh.eco.istad.platform.authorization.domain.entity.user.User;
import kh.eco.istad.platform.authorization.domain.entity.user.UserProfile;
import kh.eco.istad.platform.authorization.domain.valueobject.EmailAddress;
import kh.eco.istad.platform.authorization.domain.valueobject.PostalAddress;
import kh.eco.istad.platform.authorization.domain.valueobject.Username;
import kh.eco.istad.iam.persistence.jpa.entity.AuditedRecord;
import kh.eco.istad.iam.persistence.jpa.entity.IdentityEntity;
import kh.eco.istad.iam.persistence.jpa.entity.PermissionEntity;
import kh.eco.istad.iam.persistence.jpa.entity.RoleEntity;
import kh.eco.istad.iam.persistence.jpa.entity.RolePermissionEntity;
import kh.eco.istad.iam.persistence.jpa.entity.UserEntity;
import kh.eco.istad.iam.persistence.jpa.entity.UserPermissionEntity;
import kh.eco.istad.iam.persistence.jpa.entity.UserRoleEntity;

import java.util.List;
import java.util.UUID;

final class DomainMapper {
    private DomainMapper() {
    }

    static User toDomain(
            UserEntity e,
            List<Identity> identities
    ) {
        PostalAddress address = e.getAddressStreetAddress() == null && e.getAddressLocality() == null
                && e.getAddressRegion() == null && e.getAddressPostalCode() == null
                && e.getAddressCountry() == null ? null : new PostalAddress(e.getAddressStreetAddress(),
                e.getAddressLocality(), e.getAddressRegion(), e.getAddressPostalCode(), e.getAddressCountry());
        UserProfile profile = new UserProfile(e.getGivenName(), e.getFamilyName(), e.getMiddleName(),
                e.getNickname(), e.getGender(), e.getBirthdate(), e.getPhoneNumber(), e.getPictureUrl(),
                e.getWebsiteUrl(), e.getProfileUrl(), e.getZoneinfo(), e.getLocale(), address);
        return User.restore(e.getUuid(), new Username(e.getUsername()), new EmailAddress(e.getEmail()),
                e.isEmailVerified(), e.getPasswordHash(), profile, e.isEnabled(), e.isAccountNonExpired(),
                e.isAccountNonLocked(), e.isCredentialsNonExpired(), e.getFailedLoginAttempts(),
                e.getLastLoginAt(), e.getPasswordChangedAt(), identities, e.isDeleted(), e.getDeletedAt(),
                e.getDeletedBy(), e.getCreatedBy(), e.getCreatedAt(), e.getUpdatedBy(), e.getUpdatedAt(), e.getVersion());
    }

    static void copyTo(User d, UserEntity e) {
        e.setUuid(d.getUuid());
        e.setUsername(d.getUsername().value());
        e.setEmail(d.getEmail().value());
        e.setEmailVerified(d.isEmailVerified());
        e.setPasswordHash(d.getPasswordHash());
        UserProfile p = d.getProfile();
        e.setGivenName(p.givenName());
        e.setFamilyName(p.familyName());
        e.setMiddleName(p.middleName());
        e.setNickname(p.nickname());
        e.setGender(p.gender());
        e.setBirthdate(p.birthdate());
        e.setPhoneNumber(p.phoneNumber());
        e.setPictureUrl(p.pictureUrl());
        e.setWebsiteUrl(p.websiteUrl());
        e.setProfileUrl(p.profileUrl());
        e.setZoneinfo(p.zoneinfo());
        e.setLocale(p.locale());
        PostalAddress a = p.address();
        e.setAddressStreetAddress(a == null ? null : a.streetAddress());
        e.setAddressLocality(a == null ? null : a.locality());
        e.setAddressRegion(a == null ? null : a.region());
        e.setAddressPostalCode(a == null ? null : a.postalCode());
        e.setAddressCountry(a == null ? null : a.country());
        e.setEnabled(d.isEnabled());
        e.setAccountNonExpired(d.isAccountNonExpired());
        e.setAccountNonLocked(d.isAccountNonLocked());
        e.setCredentialsNonExpired(d.isCredentialsNonExpired());
        e.setFailedLoginAttempts(d.getFailedLoginAttempts());
        e.setLastLoginAt(d.getLastLoginAt());
        e.setPasswordChangedAt(d.getPasswordChangedAt());
        copyAudit(d, e);
    }

    static Identity toDomain(IdentityEntity e) {
        return Identity.restore(
                e.getUuid(),
                IdentityProvider.valueOf(e.getProvider()),
                e.getProviderSubject(),
                e.getEmail(),
                e.isEmailVerified(),
                e.getDisplayName(),
                e.getUsername(),
                e.getPictureUrl(),
                e.getLinkedAt(),
                e.getLastLoginAt(),
                e.isDeleted(),
                e.getDeletedAt(),
                e.getDeletedBy(),
                e.getCreatedBy(),
                e.getCreatedAt(),
                e.getUpdatedBy(),
                e.getUpdatedAt(),
                e.getVersion());
    }

    static void copyTo(Identity d, IdentityEntity e, Long userId) {
        e.setUuid(d.getUuid());
        e.setUserId(userId);
        e.setProvider(d.getProvider().name());
        e.setProviderSubject(d.getProviderSubject());
        e.setEmail(d.getEmail());
        e.setEmailVerified(d.isEmailVerified());
        e.setDisplayName(d.getDisplayName());
        e.setUsername(d.getUsername());
        e.setPictureUrl(d.getPictureUrl());
        e.setLinkedAt(d.getLinkedAt());
        e.setLastLoginAt(d.getLastLoginAt());
        copyAudit(d, e);
    }

    static Role toDomain(RoleEntity e) {
        return Role.restore(
                e.getUuid(),
                e.getName(),
                e.getDescription(),
                e.isSystem(),
                e.isActive(),
                e.isDeleted(),
                e.getDeletedAt(),
                e.getDeletedBy(),
                e.getCreatedBy(),
                e.getCreatedAt(),
                e.getUpdatedBy(),
                e.getUpdatedAt(),
                e.getVersion());
    }

    static void copyTo(Role d, RoleEntity e) {
        e.setUuid(d.getUuid());
        e.setName(d.getName());
        e.setDescription(d.getDescription());
        e.setSystem(d.isSystem());
        e.setActive(d.isActive());
        copyAudit(d, e);
    }

    static Permission toDomain(PermissionEntity e) {
        return Permission.restore(
                e.getUuid(),
                e.getResource(),
                e.getAction(),
                e.getDescription(),
                e.isSystem(),
                e.isActive(),
                e.isDeleted(),
                e.getDeletedAt(),
                e.getDeletedBy(),
                e.getCreatedBy(),
                e.getCreatedAt(),
                e.getUpdatedBy(),
                e.getUpdatedAt(),
                e.getVersion());
    }

    static void copyTo(Permission d, PermissionEntity e) {
        e.setUuid(d.getUuid());
        e.setName(d.name());
        e.setResource(d.getResource());
        e.setAction(d.getAction());
        e.setDescription(d.getDescription());
        e.setSystem(d.isSystem());
        e.setActive(d.isActive());
        copyAudit(d, e);
    }

    static UserRole toDomain(
            UserRoleEntity e,
            UUID userUuid,
            UUID roleUuid
    ) {
        return UserRole.restore(
                userUuid,
                roleUuid,
                e.getAssignedAt(),
                e.getAssignedBy(),
                e.getExpiresAt(),
                e.getRevokedAt(),
                e.getRevokedBy(),
                e.getReason());
    }

    static RolePermission toDomain(
            RolePermissionEntity e,
            UUID roleUuid,
            UUID permissionUuid
    ) {
        return RolePermission.restore(
                roleUuid, permissionUuid, e.getAssignedAt(), e.getAssignedBy(),
                e.getExpiresAt(), e.getRevokedAt(), e.getRevokedBy(), e.getReason());
    }

    static UserPermission toDomain(
            UserPermissionEntity e,
            UUID userUuid,
            UUID permissionUuid
    ) {
        return UserPermission.restore(
                userUuid,
                permissionUuid,
                PermissionEffect.valueOf(e.getEffect()),
                e.getAssignedAt(),
                e.getAssignedBy(),
                e.getExpiresAt(),
                e.getRevokedAt(),
                e.getRevokedBy(),
                e.getReason());
    }

    private static void copyAudit(AuditableEntity d, AuditedRecord e) {
        e.setDeleted(d.isDeleted());
        e.setDeletedAt(d.getDeletedAt());
        e.setDeletedBy(d.getDeletedBy());
        e.setCreatedAt(d.getCreatedAt());
        e.setCreatedBy(d.getCreatedBy());
        e.setUpdatedAt(d.getUpdatedAt());
        e.setUpdatedBy(d.getUpdatedBy());
    }
}
