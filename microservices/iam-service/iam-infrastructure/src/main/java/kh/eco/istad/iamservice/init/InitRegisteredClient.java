//package kh.eco.istad.iamservice.init;
//
//import jakarta.annotation.PostConstruct;
//import lombok.RequiredArgsConstructor;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.security.crypto.password.PasswordEncoder;
//import org.springframework.security.oauth2.core.AuthorizationGrantType;
//import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
//import org.springframework.security.oauth2.core.oidc.OidcScopes;
//import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
//import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository;
//import org.springframework.security.oauth2.server.authorization.settings.ClientSettings;
//import org.springframework.security.oauth2.server.authorization.settings.OAuth2TokenFormat;
//import org.springframework.security.oauth2.server.authorization.settings.TokenSettings;
//
//import java.time.Duration;
//import java.util.UUID;
//
//@Configuration
//@RequiredArgsConstructor
//public class InitRegisteredClient {
//
//    private final RegisteredClientRepository registeredClientRepository;
//    private final PasswordEncoder passwordEncoder;
//
//    @Value("${iam.security.dcr.client-secret:}")
//    private String dcrClientSecret;
//
//    // Secrets for the confidential clients (set these in .env / environment)
//    @Value("${iam.security.oidc-client.secret:}")
//    private String oidcClientSecret;
//
//    @Value("${iam.security.postman-client.secret:}")
//    private String postmanClientSecret;
//
//    @PostConstruct
//    public void init() {
//
//        TokenSettings tokenSettings = TokenSettings.builder()
//                .accessTokenFormat(OAuth2TokenFormat.SELF_CONTAINED)
//                .accessTokenTimeToLive(Duration.ofHours(5))
//                .refreshTokenTimeToLive(Duration.ofDays(7))
//                .authorizationCodeTimeToLive(Duration.ofMinutes(3))
//                .reuseRefreshTokens(false)
//                .build();
//
//        // ------------------------------------------------------------------
//        // oidc-client (confidential, so refresh tokens are issued)
//        // ------------------------------------------------------------------
//        requireSecret(oidcClientSecret, "IAM_OIDC_CLIENT_SECRET");
//
//        ClientSettings oidcClientSettings = ClientSettings.builder()
//                .requireProofKey(true)
//                .requireAuthorizationConsent(true)
//                .build();
//
//        RegisteredClient existingOidc = registeredClientRepository.findByClientId("oidc-client");
//        RegisteredClient oidcClient = RegisteredClient
//                .withId(existingOidc != null ? existingOidc.getId() : UUID.randomUUID().toString())
//                .clientId("oidc-client")
//                .clientSecret(passwordEncoder.encode(oidcClientSecret))
//                .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_BASIC)
//                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
//                .authorizationGrantType(AuthorizationGrantType.REFRESH_TOKEN)
//                .redirectUri("http://127.0.0.1:8080/login/oauth2/code/oidc-client")
//                .postLogoutRedirectUri("http://127.0.0.1:8080/")
//                .scope(OidcScopes.OPENID)
//                .scope(OidcScopes.PROFILE)
//                .scope(OidcScopes.EMAIL)
//                .scope(OidcScopes.PHONE)
//                .scope(OidcScopes.ADDRESS)
//                .clientSettings(oidcClientSettings)
//                .tokenSettings(tokenSettings)
//                .build();
//        RegisteredClient frontBffClient = RegisteredClient
//                .withId(existingOidc != null ? existingOidc.getId() : UUID.randomUUID().toString())
//                .clientId("front-bff-client")
//                .clientSecret(passwordEncoder.encode(oidcClientSecret))
//                .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_BASIC)
//                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
//                .authorizationGrantType(AuthorizationGrantType.REFRESH_TOKEN)
//                .redirectUri("http://localhost:9999/login/oauth2/code/front-bff-client")
//                .postLogoutRedirectUri("http://127.0.0.1:8080/")
//                .scope(OidcScopes.OPENID)
//                .scope(OidcScopes.PROFILE)
//                .scope(OidcScopes.EMAIL)
//                .scope(OidcScopes.PHONE)
//                .scope(OidcScopes.ADDRESS)
//                .clientSettings(oidcClientSettings)
//                .tokenSettings(tokenSettings)
//                .build();
//        registeredClientRepository.save(oidcClient); // insert or update
//
//        var client2 = registeredClientRepository.findByClientId("frontBffClient");
//        // ------------------------------------------------------------------
//        // iam-postman (confidential, so refresh tokens are issued)
//        // ------------------------------------------------------------------
//        requireSecret(postmanClientSecret, "IAM_POSTMAN_CLIENT_SECRET");
//
//        ClientSettings postmanClientSettings = ClientSettings.builder()
//                .requireProofKey(true)
//                .requireAuthorizationConsent(false)
//                .build();
//
//        RegisteredClient existingPostman = registeredClientRepository.findByClientId("iam-postman");
//        RegisteredClient postmanClient = RegisteredClient
//                .withId(existingPostman != null ? existingPostman.getId() : UUID.randomUUID().toString())
//                .clientId("iam-postman")
//                .clientName("IAM Postman (local development)")
//                .clientSecret(passwordEncoder.encode(postmanClientSecret))
//                .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_BASIC)
//                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
//                .authorizationGrantType(AuthorizationGrantType.REFRESH_TOKEN)
//                .redirectUri("https://oauth.pstmn.io/v1/callback")
//                .scope(OidcScopes.OPENID)
//                .scope(OidcScopes.PROFILE)
//                .scope(OidcScopes.EMAIL)
//                .scope(OidcScopes.PHONE)
//                .scope(OidcScopes.ADDRESS)
//                .clientSettings(postmanClientSettings)
//                .tokenSettings(tokenSettings)
//                .build();
//        registeredClientRepository.save(postmanClient); // insert or update
//        // ------------------------------------------------------------------
//        // iam-client-registrar (DCR) - unchanged
//        // ------------------------------------------------------------------
//        if (dcrClientSecret != null && !dcrClientSecret.isBlank()
//                && registeredClientRepository.findByClientId("iam-client-registrar") == null) {
//            if (dcrClientSecret.length() < 32) {
//                throw new IllegalStateException("IAM_DCR_CLIENT_SECRET must contain at least 32 characters");
//            }
//            RegisteredClient registrarClient = RegisteredClient.withId(UUID.randomUUID().toString())
//                    .clientId("iam-client-registrar")
//                    .clientName("IAM Dynamic Client Registrar")
//                    .clientSecret(passwordEncoder.encode(dcrClientSecret))
//                    .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_BASIC)
//                    .authorizationGrantType(AuthorizationGrantType.CLIENT_CREDENTIALS)
//                    .scope("client.create")
//                    .tokenSettings(tokenSettings)
//                    .build();
//            registeredClientRepository.save(registrarClient);
//        }
//    }
//
//    private void requireSecret(String secret, String envName) {
//        if (secret == null || secret.isBlank()) {
//            throw new IllegalStateException(envName + " must be set");
//        }
//    }
//}



package kh.eco.istad.iamservice.init;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.core.oidc.OidcScopes;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository;
import org.springframework.security.oauth2.server.authorization.settings.ClientSettings;
import org.springframework.security.oauth2.server.authorization.settings.OAuth2TokenFormat;
import org.springframework.security.oauth2.server.authorization.settings.TokenSettings;

import java.time.Duration;
import java.util.UUID;

@Configuration
@RequiredArgsConstructor
public class InitRegisteredClient {

    private final RegisteredClientRepository registeredClientRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${iam.security.oidc-client.secret}")
    private String oidcClientSecret;

    @Value("${iam.security.front-bff-client.secret}")
    private String frontBffClientSecret;

    @Value("${iam.security.dcr.client-secret:}")
    private String dcrClientSecret;

    @PostConstruct
    public void init() {

        TokenSettings tokenSettings = TokenSettings.builder()
                .accessTokenFormat(OAuth2TokenFormat.SELF_CONTAINED)
                .accessTokenTimeToLive(Duration.ofHours(5))
                .refreshTokenTimeToLive(Duration.ofDays(7))
                .authorizationCodeTimeToLive(Duration.ofMinutes(3))
                .reuseRefreshTokens(false)
                .build();

        // ---------------------------------------------------------
        // OIDC CLIENT
        // ---------------------------------------------------------

        requireSecret(oidcClientSecret, "IAM_OIDC_CLIENT_SECRET");

        RegisteredClient existingOidc =
                registeredClientRepository.findByClientId("oidc-client");

        RegisteredClient oidcClient = RegisteredClient
                .withId(existingOidc != null
                        ? existingOidc.getId()
                        : UUID.randomUUID().toString())
                .clientId("oidc-client")
                .clientName("OIDC Client")
                .clientSecret(encodeSecret(oidcClientSecret, existingOidc))
                .clientAuthenticationMethod(
                        ClientAuthenticationMethod.CLIENT_SECRET_BASIC
                )
                .authorizationGrantType(
                        AuthorizationGrantType.AUTHORIZATION_CODE
                )
                .authorizationGrantType(
                        AuthorizationGrantType.REFRESH_TOKEN
                )
                .redirectUri(
                        "http://127.0.0.1:8080/login/oauth2/code/oidc-client"
                )
                .postLogoutRedirectUri("http://127.0.0.1:8080/")
                .scope(OidcScopes.OPENID)
                .scope(OidcScopes.PROFILE)
                .scope(OidcScopes.EMAIL)
                .scope(OidcScopes.PHONE)
                .scope(OidcScopes.ADDRESS)
                .clientSettings(
                        ClientSettings.builder()
                                .requireProofKey(true)
                                .requireAuthorizationConsent(true)
                                .build()
                )
                .tokenSettings(tokenSettings)
                .build();

        registeredClientRepository.save(oidcClient);

        // ---------------------------------------------------------
        // FRONT BFF CLIENT
        // ---------------------------------------------------------

        requireSecret(frontBffClientSecret, "IAM_FRONT_BFF_CLIENT_SECRET");

        RegisteredClient existingBff =
                registeredClientRepository.findByClientId("front-bff-client");

        RegisteredClient frontBffClient = RegisteredClient
                .withId(existingBff != null
                        ? existingBff.getId()
                        : UUID.randomUUID().toString())
                .clientId("front-bff-client")
                .clientName("Frontend BFF Client")
                .clientSecret(encodeSecret(frontBffClientSecret, existingBff))
                .clientAuthenticationMethod(
                        ClientAuthenticationMethod.CLIENT_SECRET_BASIC
                )
                .authorizationGrantType(
                        AuthorizationGrantType.AUTHORIZATION_CODE
                )
                .authorizationGrantType(
                        AuthorizationGrantType.REFRESH_TOKEN
                )
                .redirectUri(
                        "http://localhost:9999/login/oauth2/code/front-bff-client"
                )
                .postLogoutRedirectUri("http://localhost:9999/")
                .scope(OidcScopes.OPENID)
                .scope(OidcScopes.PROFILE)
                .scope(OidcScopes.EMAIL)
                .clientSettings(
                        ClientSettings.builder()
                                .requireProofKey(true)
                                .requireAuthorizationConsent(false)
                                .build()
                )
                .tokenSettings(tokenSettings)
                .build();

        registeredClientRepository.save(frontBffClient);

        // ---------------------------------------------------------
        // DYNAMIC CLIENT REGISTRAR (OPTIONAL)
        // ---------------------------------------------------------

        if (dcrClientSecret != null && !dcrClientSecret.isBlank()) {

            if (dcrClientSecret.length() < 32) {
                throw new IllegalStateException(
                        "IAM_DCR_CLIENT_SECRET must contain at least 32 characters"
                );
            }

            RegisteredClient existingDcr =
                    registeredClientRepository.findByClientId(
                            "iam-client-registrar"
                    );

            if (existingDcr == null) {

                RegisteredClient registrarClient =
                        RegisteredClient.withId(UUID.randomUUID().toString())
                                .clientId("iam-client-registrar")
                                .clientName("IAM Dynamic Client Registrar")
                                .clientSecret(passwordEncoder.encode(dcrClientSecret))
                                .clientAuthenticationMethod(
                                        ClientAuthenticationMethod.CLIENT_SECRET_BASIC
                                )
                                .authorizationGrantType(
                                        AuthorizationGrantType.CLIENT_CREDENTIALS
                                )
                                .scope("client.create")
                                .tokenSettings(tokenSettings)
                                .build();

                registeredClientRepository.save(registrarClient);
            }
        }
    }

    private String encodeSecret(
            String rawSecret,
            RegisteredClient existing
    ) {
        if (existing != null
                && existing.getClientSecret() != null
                && passwordEncoder.matches(
                rawSecret,
                existing.getClientSecret()
        )) {
            return existing.getClientSecret();
        }

        return passwordEncoder.encode(rawSecret);
    }

    private void requireSecret(String secret, String envName) {
        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException(
                    envName + " must be set"
            );
        }
    }
}
