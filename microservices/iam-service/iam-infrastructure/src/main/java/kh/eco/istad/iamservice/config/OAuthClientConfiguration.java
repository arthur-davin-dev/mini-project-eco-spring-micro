//package kh.eco.istad.iamservice.config;
//
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.boot.context.properties.bind.Bindable;
//import org.springframework.boot.context.properties.bind.Binder;
//import org.springframework.core.env.Environment;
//import org.springframework.security.oauth2.client.registration.ClientRegistration;
//import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
//import org.springframework.security.oauth2.core.AuthorizationGrantType;
//import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
//
//import java.util.ArrayList;
//import java.util.Iterator;
//import java.util.LinkedHashMap;
//import java.util.List;
//import java.util.Map;
//
//@Configuration
//public class OAuthClientConfiguration {
//
//    @Bean
//    ClientRegistrationRepository clientRegistrationRepository(Environment environment) {
//        List<ClientRegistration> registrations = new ArrayList<>();
//        addIfConfigured(registrations, registration(environment, "google"));
//        addIfConfigured(registrations, registration(environment, "github"));
//        addIfConfigured(registrations, registration(environment, "facebook"));
//        addIfConfigured(registrations, registration(environment, "telegram"));
//        return new ConfiguredClientRegistrations(registrations);
//    }
//
//    private static ClientRegistration registration(Environment env, String registrationId) {
//        String registrationPrefix = "spring.security.oauth2.client.registration." + registrationId;
//        String clientId = env.getProperty(registrationPrefix + ".client-id");
//        String clientSecret = env.getProperty(registrationPrefix + ".client-secret");
//        if (blank(clientId) || blank(clientSecret)) return null;
//
//        String providerId = env.getProperty(registrationPrefix + ".provider", registrationId);
//        String providerPrefix = "spring.security.oauth2.client.provider." + providerId;
//        String authenticationMethod = env.getProperty(registrationPrefix + ".client-authentication-method",
//                "client_secret_basic");
//        String[] scopes = Binder.get(env)
//                .bind(registrationPrefix + ".scope", Bindable.listOf(String.class))
//                .orElseGet(List::of)
//                .toArray(String[]::new);
//
//        ClientRegistration.Builder registration = ClientRegistration.withRegistrationId(registrationId)
//                .clientId(clientId)
//                .clientSecret(clientSecret)
//                .clientAuthenticationMethod(clientAuthenticationMethod(authenticationMethod))
//                .authorizationGrantType(new AuthorizationGrantType(env.getProperty(
//                        registrationPrefix + ".authorization-grant-type", "authorization_code")))
//                .redirectUri(env.getProperty(registrationPrefix + ".redirect-uri",
//                        "{baseUrl}/login/oauth2/code/{registrationId}"))
//                .scope(scopes)
//                .authorizationUri(env.getRequiredProperty(providerPrefix + ".authorization-uri"))
//                .tokenUri(env.getRequiredProperty(providerPrefix + ".token-uri"))
//                .userNameAttributeName(env.getRequiredProperty(providerPrefix + ".user-name-attribute"))
//                .clientName(capitalize(registrationId));
//
//        String userInfoUri = env.getProperty(providerPrefix + ".user-info-uri");
//        if (!blank(userInfoUri)) registration.userInfoUri(userInfoUri);
//        String jwkSetUri = env.getProperty(providerPrefix + ".jwk-set-uri");
//        if (!blank(jwkSetUri)) registration.jwkSetUri(jwkSetUri);
//        String issuerUri = env.getProperty(providerPrefix + ".issuer-uri");
//        if (!blank(issuerUri)) registration.issuerUri(issuerUri);
//        return registration.build();
//    }
//
//    private static ClientAuthenticationMethod clientAuthenticationMethod(String value) {
//        return switch (value) {
//            case "client_secret_post" -> ClientAuthenticationMethod.CLIENT_SECRET_POST;
//            case "client_secret_basic" -> ClientAuthenticationMethod.CLIENT_SECRET_BASIC;
//            default -> throw new IllegalArgumentException(
//                    "Unsupported OAuth client authentication method: " + value);
//        };
//    }
//
//    private static String capitalize(String value) {
//        return value.substring(0, 1).toUpperCase(java.util.Locale.ROOT) + value.substring(1);
//    }
//
//    private static void addIfConfigured(List<ClientRegistration> registrations, ClientRegistration registration) {
//        if (registration != null) registrations.add(registration);
//    }
//
//    private static boolean blank(String value) {
//        return value == null || value.isBlank();
//    }
//
//    private static final class ConfiguredClientRegistrations
//            implements ClientRegistrationRepository, Iterable<ClientRegistration> {
//        private final Map<String, ClientRegistration> registrations;
//
//        private ConfiguredClientRegistrations(List<ClientRegistration> registrations) {
//            Map<String, ClientRegistration> byId = new LinkedHashMap<>();
//            registrations.forEach(registration -> byId.put(registration.getRegistrationId(), registration));
//            this.registrations = Map.copyOf(byId);
//        }
//
//        @Override
//        public ClientRegistration findByRegistrationId(String registrationId) {
//            return registrations.get(registrationId);
//        }
//
//        @Override
//        public Iterator<ClientRegistration> iterator() {
//            return registrations.values().iterator();
//        }
//    }
//}


package kh.eco.istad.iamservice.config;

import org.springframework.boot.context.properties.bind.Bindable;
import org.springframework.boot.context.properties.bind.Binder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.client.ClientHttpResponse;
import org.springframework.security.oauth2.client.oidc.authentication.OidcIdTokenDecoderFactory;
import org.springframework.security.oauth2.client.oidc.authentication.OidcIdTokenValidator;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.jwt.JwtDecoderFactory;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.zip.GZIPInputStream;

@Configuration
public class OAuthClientConfiguration {

    @Bean
    ClientRegistrationRepository clientRegistrationRepository(Environment environment) {
        List<ClientRegistration> registrations = new ArrayList<>();
        addIfConfigured(registrations, registration(environment, "google"));
        addIfConfigured(registrations, registration(environment, "github"));
        addIfConfigured(registrations, registration(environment, "facebook"));
        addIfConfigured(registrations, registration(environment, "telegram"));
        return new ConfiguredClientRegistrations(registrations);
    }

    @Bean
    JwtDecoderFactory<ClientRegistration> idTokenDecoderFactory() {
        OidcIdTokenDecoderFactory defaultFactory = new OidcIdTokenDecoderFactory();

        RestTemplate restTemplate = new RestTemplate();
        restTemplate.getInterceptors().add((request, body, execution) -> {
            request.getHeaders().set(HttpHeaders.ACCEPT, "application/json");
            ClientHttpResponse response = execution.execute(request, body);
            String encoding = response.getHeaders().getFirst(HttpHeaders.CONTENT_ENCODING);
            return "gzip".equalsIgnoreCase(encoding) ? new GunzippedResponse(response) : response;
        });

        return registration -> {
            if (!"telegram".equals(registration.getRegistrationId())) {
                return defaultFactory.createDecoder(registration);
            }
            NimbusJwtDecoder decoder = NimbusJwtDecoder
                    .withJwkSetUri(registration.getProviderDetails().getJwkSetUri())
                    .restOperations(restTemplate)
                    .build();
            decoder.setJwtValidator(new OidcIdTokenValidator(registration));
            return decoder;
        };
    }

    private static ClientRegistration registration(Environment env, String registrationId) {
        String registrationPrefix = "spring.security.oauth2.client.registration." + registrationId;
        String clientId = env.getProperty(registrationPrefix + ".client-id");
        String clientSecret = env.getProperty(registrationPrefix + ".client-secret");
        if (blank(clientId) || blank(clientSecret)) return null;

        String providerId = env.getProperty(registrationPrefix + ".provider", registrationId);
        String providerPrefix = "spring.security.oauth2.client.provider." + providerId;
        String authenticationMethod = env.getProperty(registrationPrefix + ".client-authentication-method",
                "client_secret_basic");
        String[] scopes = Binder.get(env)
                .bind(registrationPrefix + ".scope", Bindable.listOf(String.class))
                .orElseGet(List::of)
                .toArray(String[]::new);

        ClientRegistration.Builder registration = ClientRegistration.withRegistrationId(registrationId)
                .clientId(clientId)
                .clientSecret(clientSecret)
                .clientAuthenticationMethod(clientAuthenticationMethod(authenticationMethod))
                .authorizationGrantType(new AuthorizationGrantType(env.getProperty(
                        registrationPrefix + ".authorization-grant-type", "authorization_code")))
                .redirectUri(env.getProperty(registrationPrefix + ".redirect-uri",
                        "{baseUrl}/login/oauth2/code/{registrationId}"))
                .scope(scopes)
                .authorizationUri(env.getRequiredProperty(providerPrefix + ".authorization-uri"))
                .tokenUri(env.getRequiredProperty(providerPrefix + ".token-uri"))
                .userNameAttributeName(env.getRequiredProperty(providerPrefix + ".user-name-attribute"))
                .clientName(capitalize(registrationId));

        String userInfoUri = env.getProperty(providerPrefix + ".user-info-uri");
        if (!blank(userInfoUri)) registration.userInfoUri(userInfoUri);
        String jwkSetUri = env.getProperty(providerPrefix + ".jwk-set-uri");
        if (!blank(jwkSetUri)) registration.jwkSetUri(jwkSetUri);
        String issuerUri = env.getProperty(providerPrefix + ".issuer-uri");
        if (!blank(issuerUri)) registration.issuerUri(issuerUri);
        return registration.build();
    }

    private static ClientAuthenticationMethod clientAuthenticationMethod(String value) {
        return switch (value) {
            case "client_secret_post" -> ClientAuthenticationMethod.CLIENT_SECRET_POST;
            case "client_secret_basic" -> ClientAuthenticationMethod.CLIENT_SECRET_BASIC;
            default -> throw new IllegalArgumentException(
                    "Unsupported OAuth client authentication method: " + value);
        };
    }

    private static String capitalize(String value) {
        return value.substring(0, 1).toUpperCase(java.util.Locale.ROOT) + value.substring(1);
    }

    private static void addIfConfigured(List<ClientRegistration> registrations, ClientRegistration registration) {
        if (registration != null) registrations.add(registration);
    }

    private static boolean blank(String value) {
        return value == null || value.isBlank();
    }

    private static final class ConfiguredClientRegistrations
            implements ClientRegistrationRepository, Iterable<ClientRegistration> {
        private final Map<String, ClientRegistration> registrations;

        private ConfiguredClientRegistrations(List<ClientRegistration> registrations) {
            Map<String, ClientRegistration> byId = new LinkedHashMap<>();
            registrations.forEach(registration -> byId.put(registration.getRegistrationId(), registration));
            this.registrations = Map.copyOf(byId);
        }

        @Override
        public ClientRegistration findByRegistrationId(String registrationId) {
            return registrations.get(registrationId);
        }

        @Override
        public Iterator<ClientRegistration> iterator() {
            return registrations.values().iterator();
        }
    }

    /**
     * Wraps a gzip-encoded response and exposes the decompressed body.
     */
    private static final class GunzippedResponse implements ClientHttpResponse {
        private final ClientHttpResponse delegate;

        private GunzippedResponse(ClientHttpResponse delegate) {
            this.delegate = delegate;
        }

        @Override
        public InputStream getBody() throws IOException {
            return new GZIPInputStream(delegate.getBody());
        }

        @Override
        public HttpHeaders getHeaders() {
            HttpHeaders headers = new HttpHeaders();
            delegate.getHeaders().forEach((name, values) -> {
                if (!HttpHeaders.CONTENT_ENCODING.equalsIgnoreCase(name)
                        && !HttpHeaders.CONTENT_LENGTH.equalsIgnoreCase(name)) {
                    headers.addAll(name, values);
                }
            });
            return headers;
        }

        @Override
        public HttpStatusCode getStatusCode() throws IOException {
            return delegate.getStatusCode();
        }

        @Override
        public String getStatusText() throws IOException {
            return delegate.getStatusText();
        }

        @Override
        public void close() {
            delegate.close();
        }
    }
}