package kh.eco.istad.iamservice.config;

import kh.eco.istad.platform.authorization.domain.dto.user.result.AuthUserResult;
import kh.eco.istad.platform.authorization.domain.entity.user.UserProfile;
import kh.eco.istad.platform.authorization.domain.valueobject.PostalAddress;
import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.core.oidc.OidcScopes;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class TokenConfigTest {

    @Test
    void mapsOidcClaimsOnlyForGrantedScopes() {
        Instant updatedAt = Instant.parse("2026-11-05T02:15:00Z");
        var profile = new UserProfile("Dara", "Sok", "K", "Dara", "male",
                LocalDate.of(2003, 5, 20), "+85512345678", "https://example.test/picture",
                "https://example.test", "https://example.test/profile", "Asia/Phnom_Penh", "km",
                new PostalAddress("Street 1", "Phnom Penh", "Phnom Penh", "12000", "KH"));
        var user = new AuthUserResult(UUID.randomUUID(), "sokdara", "dara@example.test", true,
                profile, updatedAt, "{bcrypt}hash", true, true, true, true,
                List.of("ROLE_USER", "user:read"));

        var emailOnly = TokenConfig.oidcClaims(user, Set.of(OidcScopes.EMAIL));
        assertEquals("dara@example.test", emailOnly.get("email"));
        assertEquals(true, emailOnly.get("email_verified"));
        assertFalse(emailOnly.containsKey("given_name"));

        var allScopes = TokenConfig.oidcClaims(user,
                Set.of(OidcScopes.PROFILE, OidcScopes.EMAIL, OidcScopes.PHONE, OidcScopes.ADDRESS));
        assertEquals("Dara Sok", allScopes.get("name"));
        assertEquals("2003-05-20", allScopes.get("birthdate"));
        assertEquals(updatedAt.getEpochSecond(), allScopes.get("updated_at"));
        assertEquals(false, allScopes.get("phone_number_verified"));
        assertEquals("KH", ((java.util.Map<?, ?>) allScopes.get("address")).get("country"));
        assertTrue(allScopes.containsKey("preferred_username"));
    }
}
