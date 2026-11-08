
package kh.eco.istad.iamservice.init;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.core.oidc.OidcScopes;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository;
import org.springframework.security.oauth2.server.authorization.settings.ClientSettings;
import org.springframework.security.oauth2.server.authorization.settings.OAuth2TokenFormat;
import org.springframework.security.oauth2.server.authorization.settings.TokenSettings;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.beans.factory.annotation.Value;

import java.time.Duration;
import java.util.UUID;

@Configuration
@RequiredArgsConstructor
public class InitRegisteredClient {

    private final RegisteredClientRepository registeredClientRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${iam.security.dcr.client-secret:}")
    private String dcrClientSecret;

    @PostConstruct
    public void init(){

        TokenSettings tokenSettings = TokenSettings.builder()
                .accessTokenFormat(OAuth2TokenFormat.SELF_CONTAINED)
                .accessTokenTimeToLive(Duration.ofHours(5))
                .refreshTokenTimeToLive(Duration.ofDays(7))
                .authorizationCodeTimeToLive(Duration.ofMinutes(3))
                .reuseRefreshTokens(false)
                .build();

        ClientSettings clientSettings = ClientSettings.builder()
                .requireProofKey(true)
                .requireAuthorizationConsent(true)
                .build();

        RegisteredClient oidcClient = RegisteredClient.withId(UUID.randomUUID().toString())
                .clientId("oidc-client")
                .clientAuthenticationMethod(ClientAuthenticationMethod.NONE)
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .redirectUri("http://127.0.0.1:8080/login/oauth2/code/oidc-client")
                .postLogoutRedirectUri("http://127.0.0.1:8080/")
                .scope(OidcScopes.OPENID)
                .scope(OidcScopes.PROFILE)
                .scope(OidcScopes.EMAIL)
                .scope(OidcScopes.PHONE)
                .scope(OidcScopes.ADDRESS)
                .clientSettings(clientSettings)
                .tokenSettings(tokenSettings)
                .build();

        if (registeredClientRepository.findByClientId("oidc-client") == null) {
            registeredClientRepository.save(oidcClient);
        }

        RegisteredClient postmanClient = RegisteredClient.withId(UUID.randomUUID().toString())
                .clientId("iam-postman")
                .clientName("IAM Postman (local development)")
                .clientAuthenticationMethod(ClientAuthenticationMethod.NONE)
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .authorizationGrantType(AuthorizationGrantType.REFRESH_TOKEN)
                .redirectUri("https://oauth.pstmn.io/v1/callback")
                .scope(OidcScopes.OPENID)
                .scope(OidcScopes.PROFILE)
                .scope(OidcScopes.EMAIL)
                .scope(OidcScopes.PHONE)
                .scope(OidcScopes.ADDRESS)
                .clientSettings(ClientSettings.builder()
                        .requireProofKey(true)
                        .requireAuthorizationConsent(false)
                        .build())
                .tokenSettings(tokenSettings)
                .build();

        RegisteredClient existingPostmanClient = registeredClientRepository.findByClientId("iam-postman");
        if (existingPostmanClient == null) {
            registeredClientRepository.save(postmanClient);
        } else if (!existingPostmanClient.getAuthorizationGrantTypes()
                .contains(AuthorizationGrantType.REFRESH_TOKEN)) {
            registeredClientRepository.save(RegisteredClient.from(existingPostmanClient)
                    .authorizationGrantType(AuthorizationGrantType.REFRESH_TOKEN)
                    .build());
        }

        if (dcrClientSecret != null && !dcrClientSecret.isBlank()
                && registeredClientRepository.findByClientId("iam-client-registrar") == null) {
            if (dcrClientSecret.length() < 32) {
                throw new IllegalStateException("IAM_DCR_CLIENT_SECRET must contain at least 32 characters");
            }
            RegisteredClient registrarClient = RegisteredClient.withId(UUID.randomUUID().toString())
                    .clientId("iam-client-registrar")
                    .clientName("IAM Dynamic Client Registrar")
                    .clientSecret(passwordEncoder.encode(dcrClientSecret))
                    .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_BASIC)
                    .authorizationGrantType(AuthorizationGrantType.CLIENT_CREDENTIALS)
                    .scope("client.create")
                    .tokenSettings(tokenSettings)
                    .build();
            registeredClientRepository.save(registrarClient);
        }
    }

}
