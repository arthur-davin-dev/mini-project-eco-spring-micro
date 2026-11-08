
package kh.eco.istad.iamservice.config;

import kh.eco.istad.platform.authorization.domain.usecase.user.RecordLoginAttemptUseCase;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.proc.SecurityContext;

import java.nio.file.Files;
import java.nio.file.Path;
import java.security.KeyFactory;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.MessageDigest;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;
import java.util.List;
import java.util.Set;
import java.util.function.Consumer;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.core.convert.converter.Converter;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.OAuth2AuthorizationServerConfiguration;
import org.springframework.security.config.annotation.web.configurers.oauth2.server.authorization.OAuth2AuthorizationServerConfigurer;
import org.springframework.security.jackson.SecurityJacksonModules;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2ErrorCodes;
import org.springframework.security.oauth2.core.oidc.OidcScopes;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.server.authorization.JdbcOAuth2AuthorizationConsentService;
import org.springframework.security.oauth2.server.authorization.JdbcOAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.JdbcOAuth2AuthorizationService.JsonMapperOAuth2AuthorizationParametersMapper;
import org.springframework.security.oauth2.server.authorization.JdbcOAuth2AuthorizationService.JsonMapperOAuth2AuthorizationRowMapper;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationConsentService;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.client.JdbcRegisteredClientRepository;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository;
import org.springframework.security.oauth2.server.authorization.oidc.OidcClientRegistration;
import org.springframework.security.oauth2.server.authorization.oidc.authentication.OidcClientRegistrationAuthenticationContext;
import org.springframework.security.oauth2.server.authorization.oidc.authentication.OidcClientRegistrationAuthenticationProvider;
import org.springframework.security.oauth2.server.authorization.oidc.authentication.OidcClientRegistrationAuthenticationToken;
import org.springframework.security.oauth2.server.authorization.oidc.authentication.OidcClientRegistrationAuthenticationValidator;
import org.springframework.security.oauth2.server.authorization.oidc.converter.OidcClientRegistrationRegisteredClientConverter;
import org.springframework.security.oauth2.server.authorization.settings.AuthorizationServerSettings;
import org.springframework.security.oauth2.server.authorization.settings.ClientSettings;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.security.web.authentication.LoginUrlAuthenticationEntryPoint;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.authentication.SavedRequestAwareAuthenticationSuccessHandler;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.security.web.util.matcher.MediaTypeRequestMatcher;
import tools.jackson.databind.json.JsonMapper;
import tools.jackson.databind.jsontype.BasicPolymorphicTypeValidator;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    private static final Logger LOGGER = LoggerFactory.getLogger(SecurityConfig.class);

    private static final Set<String> DYNAMIC_CLIENT_SCOPES =
            Set.of(OidcScopes.OPENID, OidcScopes.PROFILE, OidcScopes.EMAIL, OidcScopes.PHONE, OidcScopes.ADDRESS);

    private final JdbcTemplate jdbcTemplate;
    private final FederatedOAuth2UserService federatedOAuth2UserService;
    private final FederatedOidcUserService federatedOidcUserService;
    private final FederatedLinkIntent federatedLinkIntent;
    private final RecordLoginAttemptUseCase recordLoginAttempt;
    private final HostAwareLogoutSuccessHandler hostAwareLogoutSuccessHandler;

    @Value("${spring.security.oauth2.authorizationserver.issuer}")
    private String issuer;

    @Value("${iam.security.jwk.private-key-path:}")
    private String privateKeyPath;

    @Value("${iam.security.jwk.public-key-path:}")
    private String publicKeyPath;

    // 1. Authorization Server Security
    @Bean
    @Order(0)
    public SecurityFilterChain authorizationServerSecurityFilterChain(HttpSecurity http) throws Exception {
        OAuth2AuthorizationServerConfigurer authorizationServerConfigurer = new OAuth2AuthorizationServerConfigurer();

        http.securityMatcher(authorizationServerConfigurer.getEndpointsMatcher())
                .with(authorizationServerConfigurer,
                        (authorizationServer)
                                -> authorizationServer.authorizationEndpoint(endpoint -> endpoint.consentPage("/oauth2/consent"))
                                .oidc(oidc
                                        -> oidc.clientRegistrationEndpoint(endpoint
                                        -> endpoint.authenticationProviders(requirePkceAndConsentForDynamicClients()))))
                .authorizeHttpRequests((authorize) -> authorize.anyRequest().authenticated())
                // Redirect to the login page when not authenticated from the
                // authorization endpoint
                .exceptionHandling(
                        (exceptions)
                                -> exceptions.defaultAuthenticationEntryPointFor(new LoginUrlAuthenticationEntryPoint("/login"),
                                new MediaTypeRequestMatcher(MediaType.TEXT_HTML)));

        return http.build();
    }

    private static Consumer<List<AuthenticationProvider>> requirePkceAndConsentForDynamicClients() {
        return providers -> providers.forEach(provider -> {
            if (provider instanceof OidcClientRegistrationAuthenticationProvider registrationProvider) {
                registrationProvider.setAuthenticationValidator(
                        OidcClientRegistrationAuthenticationValidator.DEFAULT_REDIRECT_URI_VALIDATOR
                                .andThen(
                                        OidcClientRegistrationAuthenticationValidator.DEFAULT_POST_LOGOUT_REDIRECT_URI_VALIDATOR)
                                .andThen(OidcClientRegistrationAuthenticationValidator.DEFAULT_JWK_SET_URI_VALIDATOR)
                                .andThen(SecurityConfig::validateDynamicClientScopes));
                Converter<OidcClientRegistration, RegisteredClient> delegate =
                        new OidcClientRegistrationRegisteredClientConverter();
                registrationProvider.setRegisteredClientConverter(registration -> {
                    RegisteredClient registeredClient = delegate.convert(registration);
                    ClientSettings clientSettings =
                            ClientSettings.withSettings(registeredClient.getClientSettings().getSettings())
                                    .requireProofKey(true)
                                    .requireAuthorizationConsent(true)
                                    .build();
                    return RegisteredClient.from(registeredClient).clientSettings(clientSettings).build();
                });
            }
        });
    }

    private static void validateDynamicClientScopes(OidcClientRegistrationAuthenticationContext context) {
        var authentication = (OidcClientRegistrationAuthenticationToken) context.getAuthentication();
        var requested = authentication.getClientRegistration().getScopes();
        if (!DYNAMIC_CLIENT_SCOPES.containsAll(requested)) {
            throw new OAuth2AuthenticationException(new OAuth2Error(
                    OAuth2ErrorCodes.INVALID_SCOPE, "Only the supported OpenID Connect scopes may be registered.", null));
        }
    }

    @Bean
    @Order(2)
    public SecurityFilterChain defaultSecurityFilterChain(HttpSecurity http) throws Exception {
        http.authorizeHttpRequests(
                        (authorize)
                                -> authorize
                                .requestMatchers("/login", "/register", "/error", "/iam.css", "/favicon.ico", "/scalar",
                                        "/scalar/**", "/v3/api-docs", "/v3/api-docs/**", "/swagger-ui/**")
                                .permitAll()
                                .anyRequest()
                                .authenticated())
                // Form login handles the redirect to the login page from the
                // authorization server filter chain
                .oauth2Login(config
                        -> config.loginPage("/login")
                        .permitAll()
                        .failureHandler(oauthLoginFailureHandler())
                        .userInfoEndpoint(userInfo
                                -> userInfo.userService(federatedOAuth2UserService).oidcUserService(federatedOidcUserService)))
                .oauth2Client(Customizer.withDefaults())
                .formLogin(config -> config.loginPage("/login")
                        .successHandler(formLoginSuccessHandler())
                        .failureHandler(formLoginFailureHandler())
                        .permitAll())
                .logout(logout
                        -> logout.logoutUrl("/logout")
                        .invalidateHttpSession(true)
                        .clearAuthentication(true)
                        .deleteCookies("JSESSIONID")
                        .logoutSuccessHandler(hostAwareLogoutSuccessHandler)   // was: .logoutSuccessUrl("/login?logout")
                        .permitAll());

        return http.build();
    }

    private AuthenticationSuccessHandler formLoginSuccessHandler() {
        SavedRequestAwareAuthenticationSuccessHandler delegate =
                new SavedRequestAwareAuthenticationSuccessHandler();
        return (request, response, authentication) -> {
            recordLoginAttempt.execute(authentication.getName(), true);
            delegate.onAuthenticationSuccess(request, response, authentication);
        };
    }

    private AuthenticationFailureHandler formLoginFailureHandler() {
        SimpleUrlAuthenticationFailureHandler delegate =
                new SimpleUrlAuthenticationFailureHandler("/login?error");
        return (request, response, exception) -> {
            recordLoginAttempt.execute(request.getParameter("username"), false);
            delegate.onAuthenticationFailure(request, response, exception);
        };
    }

    private AuthenticationFailureHandler oauthLoginFailureHandler() {
        return (request, response, exception) -> {
            String requestPath = request.getRequestURI();
            String provider = requestPath.substring(requestPath.lastIndexOf('/') + 1);
            boolean accountLink = federatedLinkIntent.targetForCurrentRequest() != null;
            boolean alreadyLinked = hasCause(exception,
                    kh.eco.istad.platform.authorization.domain.exception.ConflictException.class);
            LOGGER.error("Federated sign-in failed for provider '{}' at callback '{}': {}", provider, requestPath,
                    exception.getMessage(), exception);
            federatedLinkIntent.clear(request);
            if (accountLink) {
                response.sendRedirect(alreadyLinked ? "/profile/accounts?link_error=already_linked"
                        : "/profile/accounts?link_error=failed");
            } else {
                response.sendRedirect("/login?oauth_error");
            }
        };
    }

    private static boolean hasCause(Throwable throwable, Class<? extends Throwable> type) {
        for (Throwable cause = throwable; cause != null; cause = cause.getCause()) {
            if (type.isInstance(cause)) {
                return true;
            }
        }
        return false;
    }

    @Bean
    public RegisteredClientRepository registeredClientRepository() {
        return new JdbcRegisteredClientRepository(jdbcTemplate);
    }

    @Bean
    public OAuth2AuthorizationService oAuth2AuthorizationService() {
        BasicPolymorphicTypeValidator.Builder validator = BasicPolymorphicTypeValidator.builder()
                .allowIfSubType(Long.class)
                .allowIfSubType(Integer.class)
                .allowIfSubType(Boolean.class)
                .allowIfSubType(Double.class);
        JsonMapper jsonMapper = JsonMapper.builder()
                .addModules(SecurityJacksonModules.getModules(
                        JdbcOAuth2AuthorizationService.class.getClassLoader(), validator))
                .build();

        JdbcOAuth2AuthorizationService service =
                new JdbcOAuth2AuthorizationService(jdbcTemplate, registeredClientRepository());
        service.setAuthorizationRowMapper(
                new JsonMapperOAuth2AuthorizationRowMapper(registeredClientRepository(), jsonMapper));
        service.setAuthorizationParametersMapper(new JsonMapperOAuth2AuthorizationParametersMapper(jsonMapper));
        return service;
    }

    @Bean
    public OAuth2AuthorizationConsentService oAuth2AuthorizationConsentService() {
        return new JdbcOAuth2AuthorizationConsentService(jdbcTemplate, registeredClientRepository());
    }

    @Bean
    public JWKSource<SecurityContext> jwkSource() throws Exception {
        KeyPair keyPair = loadConfiguredRsaKey();
        RSAPublicKey publicKey = (RSAPublicKey) keyPair.getPublic();
        RSAPrivateKey privateKey = (RSAPrivateKey) keyPair.getPrivate();
        String keyId = Base64.getUrlEncoder().withoutPadding().encodeToString(
                MessageDigest.getInstance("SHA-256").digest(publicKey.getEncoded()));
        RSAKey rsaKey = new RSAKey.Builder(publicKey).privateKey(privateKey).keyID(keyId).build();
        JWKSet jwkSet = new JWKSet(rsaKey);
        return new ImmutableJWKSet<>(jwkSet);
    }

    private KeyPair loadConfiguredRsaKey() throws Exception {
        boolean privateConfigured = !privateKeyPath.isBlank();
        boolean publicConfigured = !publicKeyPath.isBlank();
        if (privateConfigured != publicConfigured) {
            throw new IllegalStateException("Configure both IAM JWK private and public key paths, or neither.");
        }
        if (!privateConfigured) {
            return generateRsaKey();
        }
        var keyFactory = KeyFactory.getInstance("RSA");
        var privateBytes = decodePem(Files.readString(Path.of(privateKeyPath)), "PRIVATE KEY");
        var publicBytes = decodePem(Files.readString(Path.of(publicKeyPath)), "PUBLIC KEY");
        var privateKey = keyFactory.generatePrivate(new PKCS8EncodedKeySpec(privateBytes));
        var publicKey = keyFactory.generatePublic(new X509EncodedKeySpec(publicBytes));
        return new KeyPair(publicKey, privateKey);
    }

    private static byte[] decodePem(String pem, String label) {
        String body = pem.replace("-----BEGIN " + label + "-----", "")
                .replace("-----END " + label + "-----", "")
                .replaceAll("\\s", "");
        return Base64.getDecoder().decode(body);
    }

    private static KeyPair generateRsaKey() {
        KeyPair keyPair;
        try {
            KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance("RSA");
            keyPairGenerator.initialize(2048);
            keyPair = keyPairGenerator.generateKeyPair();
        } catch (Exception ex) {
            throw new IllegalStateException(ex);
        }
        return keyPair;
    }

    @Bean
    public JwtDecoder jwtDecoder(JWKSource<SecurityContext> jwkSource) {
        return OAuth2AuthorizationServerConfiguration.jwtDecoder(jwkSource);
    }

    @Bean
    public AuthorizationServerSettings authorizationServerSettings() {
        return AuthorizationServerSettings.builder().issuer(issuer).build();
    }
}
