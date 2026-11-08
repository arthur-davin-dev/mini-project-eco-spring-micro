package kh.eco.istad.iamservice;

import kh.eco.istad.platform.authorization.domain.port.out.RoleRepository;
import kh.eco.istad.platform.authorization.domain.port.out.PermissionRepository;
import kh.eco.istad.platform.authorization.domain.port.out.UserRepository;
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
import kh.eco.istad.platform.authorization.domain.valueobject.Username;
import kh.eco.istad.iam.persistence.jpa.entity.IdentityEntity;
import kh.eco.istad.iam.persistence.jpa.repository.IdentityJpaRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
class IamPersistenceIntegrationTests {

    @Autowired UserRepository users;
    @Autowired RoleRepository roles;
    @Autowired PermissionRepository permissions;
    @Autowired IdentityJpaRepository identityRows;

    @Test
    @Transactional
    void persistsUserIdentityAndRevocableRoleAssignment() {
        Instant now = Instant.now();
        UUID userUuid = UUID.randomUUID();
        String suffix = userUuid.toString().substring(0, 8);
        User user = User.register(userUuid, new Username("iamtest" + suffix),
                new EmailAddress("iamtest" + suffix + "@example.test"), "{noop}test-password",
                new UserProfile("Test", "User", null, null, null, null, null, null, null,
                        null, "Asia/Phnom_Penh", "en", null), "integration-test", now);
        users.save(user);

        User loaded = users.findByUuid(userUuid).orElseThrow();
        assertEquals(user.getUsername().value(), loaded.getUsername().value());
        assertEquals(user.getProfile(), loaded.getProfile());

        var userRole = roles.findByName("USER").orElseThrow();
        UserRole assignment = UserRole.assign(userUuid, userRole, null, "integration-test", "test", now);
        users.saveUserRole(assignment);
        assertTrue(users.findUserRole(userUuid, userRole.getUuid()).orElseThrow().isActiveAt(now));

        assignment.revoke("integration-test", "test complete", now.plusSeconds(1));
        users.saveUserRole(assignment);
        assertFalse(users.findUserRole(userUuid, userRole.getUuid()).orElseThrow()
                .isActiveAt(now.plusSeconds(2)));

        Identity identity = Identity.link(UUID.randomUUID(), IdentityProvider.GITHUB, "subject-" + suffix,
                user.getEmail().value(), true, "Test User", "iamtest" + suffix, null,
                "integration-test", now);
        loaded.linkIdentity(identity, "integration-test", now);
        users.save(loaded);
        assertEquals(userUuid, users.findByIdentity(IdentityProvider.GITHUB, identity.getProviderSubject())
                .orElseThrow().getUuid());

        loaded.unlinkIdentity(identity.getUuid(), "integration-test", now.plusSeconds(2));
        users.save(loaded);
        assertTrue(users.findByIdentity(IdentityProvider.GITHUB, identity.getProviderSubject()).isEmpty());

        loaded.softDelete("integration-test", now.plusSeconds(3));
        users.save(loaded);
        assertTrue(users.findByUuid(userUuid).isEmpty());
    }

    @Test
    @Transactional
    void rejectsUpdatesBasedOnAStaleDomainVersion() {
        Instant now = Instant.now();
        UUID userUuid = UUID.randomUUID();
        String suffix = userUuid.toString().substring(0, 8);
        User user = User.register(userUuid, new Username("locktest" + suffix),
                new EmailAddress("locktest" + suffix + "@example.test"), "{noop}test-password",
                new UserProfile("Lock", "Test", null, null, null, null, null, null, null,
                        null, null, "en", null), "integration-test", now);
        users.save(user);

        User firstRead = users.findByUuid(userUuid).orElseThrow();
        User staleRead = users.findByUuid(userUuid).orElseThrow();
        firstRead.updateProfile(new UserProfile("First", "Update", null, null, null, null, null,
                null, null, null, null, "en", null), "integration-test", now.plusSeconds(1));
        users.save(firstRead);

        staleRead.updateProfile(new UserProfile("Stale", "Update", null, null, null, null, null,
                null, null, null, null, "en", null), "integration-test", now.plusSeconds(2));
        assertThrows(OptimisticLockingFailureException.class, () -> users.save(staleRead));
    }

    @Test
    @Transactional
    void persistsRolePermissionAndDirectPermissionAssignmentsAsRevocableRows() {
        Instant now = Instant.now();
        String suffix = UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
        Role customRole = Role.create(UUID.randomUUID(), "IAMTEST_" + suffix, "Persistence test role",
                "integration-test", now);
        Permission permission = Permission.create(UUID.randomUUID(), "catalog", "inspect",
                "Inspect catalog entries", "integration-test", now);
        roles.save(customRole);
        permissions.save(permission);

        RolePermission roleGrant = RolePermission.assign(customRole, permission, null,
                "integration-test", "role assignment", now);
        roles.saveRolePermission(roleGrant);
        assertTrue(roles.findRolePermission(customRole.getUuid(), permission.getUuid()).orElseThrow()
                .isActiveAt(now));
        roleGrant.revoke("integration-test", "remove role grant", now.plusSeconds(1));
        roles.saveRolePermission(roleGrant);
        assertEquals(now.plusSeconds(1), roles.findRolePermission(customRole.getUuid(), permission.getUuid())
                .orElseThrow().getRevokedAt());
        assertEquals(1, roles.findRolePermissions(customRole.getUuid()).size());

        User user = User.register(UUID.randomUUID(), new Username("permtest" + suffix.toLowerCase()),
                new EmailAddress("permtest" + suffix.toLowerCase() + "@example.test"), "{noop}test-password",
                new UserProfile("Permission", "Test", null, null, null, null, null, null,
                        null, null, null, "en", null), "integration-test", now);
        users.save(user);
        UserPermission directDeny = UserPermission.assign(user.getUuid(), permission, PermissionEffect.DENY,
                null, "integration-test", "explicit denial", now);
        users.saveUserPermission(directDeny);
        UserPermission persisted = users.findUserPermission(user.getUuid(), permission.getUuid()).orElseThrow();
        assertEquals(PermissionEffect.DENY, persisted.getEffect());
        persisted.revoke("integration-test", "remove denial", now.plusSeconds(2));
        users.saveUserPermission(persisted);
        assertEquals(now.plusSeconds(2), users.findUserPermission(user.getUuid(), permission.getUuid())
                .orElseThrow().getRevokedAt());
    }

    @Test
    @Transactional
    void rejectsAStaleIdentityVersionEvenWhenTheUserVersionHasNotChanged() {
        Instant now = Instant.now();
        UUID userUuid = UUID.randomUUID();
        String suffix = userUuid.toString().substring(0, 8);
        User user = User.register(userUuid, new Username("idlock" + suffix),
                new EmailAddress("idlock" + suffix + "@example.test"), "{noop}test-password",
                new UserProfile("Identity", "Lock", null, null, null, null, null, null,
                        null, null, null, "en", null), "integration-test", now);
        Identity identity = Identity.link(UUID.randomUUID(), IdentityProvider.GITHUB, "idlock-" + suffix,
                user.getEmail().value(), true, "Identity Lock", null, null, "integration-test", now);
        user.linkIdentity(identity, "integration-test", now);
        users.save(user);

        User staleUser = users.findByUuid(userUuid).orElseThrow();
        IdentityEntity currentRow = identityRows.findByUuid(identity.getUuid()).orElseThrow();
        currentRow.setDisplayName("Changed through another writer");
        identityRows.saveAndFlush(currentRow);

        assertThrows(OptimisticLockingFailureException.class, () -> users.save(staleUser));
    }
}
