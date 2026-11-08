package kh.eco.istad.iamservice.config;

import org.junit.jupiter.api.Test;
import org.springframework.core.env.MapPropertySource;
import org.springframework.core.env.StandardEnvironment;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class TelegramOAuthConfigurationTest {

    @Test
    void telegramRegistrationIsOptionalAndUsesTelegramOidcEndpoints() {
        var environment = new StandardEnvironment();
        environment.getPropertySources().addFirst(new MapPropertySource("telegram-test", Map.ofEntries(
                Map.entry("spring.security.oauth2.client.registration.telegram.provider", "telegram"),
                Map.entry("spring.security.oauth2.client.registration.telegram.client-id", "123456789"),
                Map.entry("spring.security.oauth2.client.registration.telegram.client-secret", "test-secret"),
                Map.entry("spring.security.oauth2.client.registration.telegram.client-authentication-method", "client_secret_basic"),
                Map.entry("spring.security.oauth2.client.registration.telegram.authorization-grant-type", "authorization_code"),
                Map.entry("spring.security.oauth2.client.registration.telegram.redirect-uri", "{baseUrl}/login/oauth2/code/{registrationId}"),
                Map.entry("spring.security.oauth2.client.registration.telegram.scope", "openid,profile"),
                Map.entry("spring.security.oauth2.client.provider.telegram.authorization-uri", "https://oauth.telegram.org/auth"),
                Map.entry("spring.security.oauth2.client.provider.telegram.token-uri", "https://oauth.telegram.org/token"),
                Map.entry("spring.security.oauth2.client.provider.telegram.jwk-set-uri", "https://oauth.telegram.org/.well-known/jwks.json"),
                Map.entry("spring.security.oauth2.client.provider.telegram.issuer-uri", "https://oauth.telegram.org"),
                Map.entry("spring.security.oauth2.client.provider.telegram.user-name-attribute", "sub"))));

        var registrations = new OAuthClientConfiguration().clientRegistrationRepository(environment);
        var telegram = registrations.findByRegistrationId("telegram");

        assertNotNull(telegram);
        assertEquals("https://oauth.telegram.org", telegram.getProviderDetails().getIssuerUri());
        assertEquals("https://oauth.telegram.org/auth", telegram.getProviderDetails().getAuthorizationUri());
        assertEquals("https://oauth.telegram.org/token", telegram.getProviderDetails().getTokenUri());
        assertEquals("https://oauth.telegram.org/.well-known/jwks.json",
                telegram.getProviderDetails().getJwkSetUri());
        assertEquals("sub", telegram.getProviderDetails().getUserInfoEndpoint().getUserNameAttributeName());
        assertEquals("https://iam.example.test/login/oauth2/code/telegram",
                telegram.getRedirectUri().replace("{baseUrl}", "https://iam.example.test")
                        .replace("{registrationId}", "telegram"));
        assertEquals("telegram", telegram.getRegistrationId());
        assertEquals("123456789", telegram.getClientId());
        assertEquals("test-secret", telegram.getClientSecret());
        assertTrue(telegram.getScopes().contains("openid"));
        assertTrue(telegram.getScopes().contains("profile"));
    }

    @Test
    void telegramIdentityUsesOidcSubjectAndSafeUnverifiedEmailPlaceholderWhenEmailIsNotShared() {
        var command = FederatedUserMapper.identityCommand("telegram", Map.of(
                "sub", "987654321",
                "id", 987654321L,
                "name", "Dara Sok",
                "given_name", "Dara",
                "family_name", "Sok",
                "preferred_username", "dara_sok",
                "picture", "https://cdn.example.test/profile.jpg"));

        assertEquals("TELEGRAM", command.provider().name());
        assertEquals("987654321", command.providerSubject());
        assertEquals("dara_sok", command.username());
        assertEquals("Dara Sok", command.displayName());
        assertEquals("Dara", command.givenName());
        assertEquals("Sok", command.familyName());
        assertEquals("https://cdn.example.test/profile.jpg", command.pictureUrl());
        assertFalse(command.emailVerified());
        assertNotNull(command.email());
        assertEquals("@users.invalid", command.email().substring(command.email().indexOf('@')));
    }

    @Test
    void telegramRegistrationIsNotCreatedWithoutBothCredentials() {
        var registrations = new OAuthClientConfiguration().clientRegistrationRepository(new StandardEnvironment());

        assertNull(registrations.findByRegistrationId("telegram"));
    }
}
