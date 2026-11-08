package kh.eco.istad.platform.authorization.domain.entity.user;

import kh.eco.istad.platform.authorization.domain.exception.DomainException;
import kh.eco.istad.platform.authorization.domain.valueobject.EmailAddress;
import kh.eco.istad.platform.authorization.domain.valueobject.PostalAddress;
import kh.eco.istad.platform.authorization.domain.valueobject.Username;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class UserDomainTest {

    private static final Instant NOW = Instant.parse("2026-11-07T00:00:00Z");

    @Test
    void normalizesEmailAndUsernameAtDomainBoundary() {
        assertEquals("dara@example.com", new EmailAddress(" Dara@Example.com ").value());
        assertEquals("dara.sok", new Username(" dara.sok ").value());
    }

    @Test
    void signInRequiresAllAccountAndCredentialChecksToPass() {
        User expiredAccount = restoredUser(true, false, true, true, false, null, null);
        User expiredCredentials = restoredUser(true, true, true, false, false, null, null);
        User disabled = restoredUser(false, true, true, true, false, null, null);
        User locked = restoredUser(true, true, false, true, false, null, null);
        User deleted = restoredUser(false, true, true, true, true, NOW, "admin");

        assertThrows(DomainException.class, expiredAccount::ensureCanSignIn);
        assertThrows(DomainException.class, expiredCredentials::ensureCanSignIn);
        assertThrows(DomainException.class, disabled::ensureCanSignIn);
        assertThrows(DomainException.class, locked::ensureCanSignIn);
        assertThrows(DomainException.class, deleted::ensureCanSignIn);
        assertTrue(user().isEnabled());
        assertTrue(user().isAccountNonExpired());
        assertTrue(user().isAccountNonLocked());
        assertTrue(user().isCredentialsNonExpired());
    }

    @Test
    void failedLoginLimitLocksAccountAndSuccessfulLoginResetsCounter() {
        User user = user();

        for (int i = 0; i < User.MAX_FAILED_LOGIN_ATTEMPTS; i++) {
            user.recordFailedLogin("auth", NOW.plusSeconds(i));
        }

        assertEquals(User.MAX_FAILED_LOGIN_ATTEMPTS, user.getFailedLoginAttempts());
        assertFalse(user.isAccountNonLocked());
        assertThrows(DomainException.class, user::ensureCanSignIn);

        user.unlock("admin", NOW.plusSeconds(10));
        user.recordSuccessfulLogin("auth", NOW.plusSeconds(11));
        assertEquals(0, user.getFailedLoginAttempts());
        assertEquals(NOW.plusSeconds(11), user.getLastLoginAt());
    }

    @Test
    void cannotUnlinkTheOnlyAvailableSignInMethod() {
        Identity identity = Identity.link(UUID.randomUUID(), IdentityProvider.GOOGLE, "subject-1",
                "dara@example.com", true, "Dara Sok", null, null, "google", NOW);
        User socialUser = User.provisionFromSocial(UUID.randomUUID(), new Username("dara.sok"),
                new EmailAddress("dara@example.com"), true, profile(), identity, "google", NOW);

        assertThrows(DomainException.class,
                () -> socialUser.unlinkIdentity(identity.getUuid(), "dara", NOW.plusSeconds(1)));

        User passwordUser = user();
        Identity linkedIdentity = Identity.link(UUID.randomUUID(), IdentityProvider.GOOGLE, "subject-2",
                "dara@example.com", true, "Dara Sok", null, null, "google", NOW);
        passwordUser.linkIdentity(linkedIdentity, "dara", NOW.plusSeconds(1));
        passwordUser.unlinkIdentity(linkedIdentity.getUuid(), "dara", NOW.plusSeconds(2));
        assertTrue(passwordUser.getActiveIdentities().isEmpty());
    }

    @Test
    void userCannotLinkTwoActiveAccountsFromSameProvider() {
        User user = user();
        Identity first = Identity.link(UUID.randomUUID(), IdentityProvider.GITHUB, "github-1",
                "dara@example.com", true, "Dara Sok", "dara", null, "github", NOW);
        Identity second = Identity.link(UUID.randomUUID(), IdentityProvider.GITHUB, "github-2",
                "dara@example.com", true, "Dara Sok", "dara2", null, "github", NOW);
        user.linkIdentity(first, "dara", NOW.plusSeconds(1));

        assertThrows(DomainException.class, () -> user.linkIdentity(second, "dara", NOW.plusSeconds(2)));
    }

    @Test
    void profileEnforcesPdfColumnLimitsAndNormalizesValues() {
        UserProfile profile = new UserProfile("Dara", "Sok", null, null, "MALE", null,
                "+85512345678", null, null, null, " Asia/Phnom_Penh ", "km", null);
        assertEquals("male", profile.gender());
        assertEquals("Asia/Phnom_Penh", profile.zoneinfo());

        assertThrows(DomainException.class, () -> new UserProfile("x".repeat(101), "Sok", null, null,
                null, null, null, null, null, null, null, "en", null));
        assertThrows(DomainException.class, () -> new UserProfile("Dara", "Sok", null, null,
                null, LocalDate.now().plusDays(1), null, null, null, null, null, "en", null));
        assertThrows(DomainException.class, () -> new PostalAddress("x".repeat(256), null,
                null, null, null));
        assertEquals("KH", new PostalAddress(null, null, null, null, "kh").country());
    }

    private static User user() {
        return User.register(UUID.randomUUID(), new Username("dara.sok"),
                new EmailAddress("dara@example.com"), "{bcrypt}hash", profile(), "test", NOW);
    }

    private static User restoredUser(boolean enabled, boolean accountNonExpired, boolean accountNonLocked,
                                     boolean credentialsNonExpired, boolean deleted,
                                     Instant deletedAt, String deletedBy) {
        return User.restore(UUID.randomUUID(), new Username("dara.sok"), new EmailAddress("dara@example.com"),
                false, "{bcrypt}hash", profile(), enabled, accountNonExpired, accountNonLocked,
                credentialsNonExpired, 0, null, null, List.of(), deleted, deletedAt, deletedBy,
                "test", NOW.minusSeconds(1), "test", NOW, 0);
    }

    private static UserProfile profile() {
        return new UserProfile("Dara", "Sok", null, null, null, null, null,
                null, null, null, null, "en", null);
    }
}
