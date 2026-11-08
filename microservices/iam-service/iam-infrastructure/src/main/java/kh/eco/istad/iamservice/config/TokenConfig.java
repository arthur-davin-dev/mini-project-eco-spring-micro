package kh.eco.istad.iamservice.config;

import kh.eco.istad.platform.authorization.domain.dto.user.result.AuthUserResult;
import kh.eco.istad.platform.authorization.domain.usecase.user.LoadUserForAuthenticationUseCase;
import kh.eco.istad.platform.authorization.domain.entity.user.UserProfile;
import kh.eco.istad.platform.authorization.domain.valueobject.PostalAddress;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.core.oidc.OidcScopes;
import org.springframework.security.oauth2.server.authorization.token.JwtEncodingContext;
import org.springframework.security.oauth2.server.authorization.token.OAuth2TokenCustomizer;

import java.util.LinkedHashMap;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Configuration
@RequiredArgsConstructor
public class TokenConfig {

    private static final String ID_TOKEN = "id_token";
    private final LoadUserForAuthenticationUseCase loadUser;

    @Bean
    public OAuth2TokenCustomizer<JwtEncodingContext> tokenCustomizer() {
        return context -> {
            if (context.getPrincipal() == null) {
                return;
            }
            loadUser.execute(context.getPrincipal().getName()).ifPresent(user -> {
                String tokenType = context.getTokenType().getValue();
                context.getClaims().subject(user.uuid().toString());
                if ("access_token".equals(tokenType)) {
                    addAccessTokenClaims(context, user);
                } else if (ID_TOKEN.equals(tokenType)) {
                    addOidcClaims(context, user, context.getAuthorizedScopes());
                }
            });
        };
    }

    private static void addAccessTokenClaims(JwtEncodingContext context, AuthUserResult user) {
        List<String> roles = user.authorities().stream()
                .filter(authority -> authority.startsWith("ROLE_"))
                .map(authority -> authority.substring("ROLE_".length()))
                .sorted()
                .collect(Collectors.toCollection(ArrayList::new));
        List<String> permissions = user.authorities().stream()
                .filter(authority -> !authority.startsWith("ROLE_"))
                .sorted()
                .collect(Collectors.toCollection(ArrayList::new));
        context.getClaims().claims(claims -> {
            claims.put("user_uuid", user.uuid().toString());
            claims.put("preferred_username", user.username());
            claims.put("roles", roles);
            claims.put("permissions", permissions);
            claims.put("authorities", new ArrayList<>(user.authorities()));
        });
    }

    private static void addOidcClaims(JwtEncodingContext context, AuthUserResult user, Set<String> scopes) {
        context.getClaims().claims(claims -> claims.putAll(oidcClaims(user, scopes)));
    }

    static Map<String, Object> oidcClaims(AuthUserResult user, java.util.Set<String> scopes) {
        UserProfile profile = user.profile();
        Map<String, Object> claims = new LinkedHashMap<>();
        if (scopes.contains(OidcScopes.PROFILE)) {
            put(claims, "name", profile.fullName());
            put(claims, "given_name", profile.givenName());
            put(claims, "family_name", profile.familyName());
            put(claims, "middle_name", profile.middleName());
            put(claims, "nickname", profile.nickname());
            put(claims, "preferred_username", user.username());
            put(claims, "profile", profile.profileUrl());
            put(claims, "picture", profile.pictureUrl());
            put(claims, "website", profile.websiteUrl());
            put(claims, "gender", profile.gender());
            put(claims, "birthdate", profile.birthdate());
            put(claims, "zoneinfo", profile.zoneinfo());
            put(claims, "locale", profile.locale());
            // OIDC updated_at is a NumericDate (seconds since the Unix epoch).
            put(claims, "updated_at", user.updatedAt().getEpochSecond());
        }
        if (scopes.contains(OidcScopes.EMAIL)) {
            put(claims, "email", user.email());
            claims.put("email_verified", user.emailVerified());
        }
        if (scopes.contains(OidcScopes.PHONE)) {
            put(claims, "phone_number", profile.phoneNumber());
            claims.put("phone_number_verified", false);
        }
        if (scopes.contains(OidcScopes.ADDRESS) && profile.address() != null) {
            claims.put("address", addressClaims(profile.address()));
        }
        return Map.copyOf(claims);
    }

    private static Map<String, Object> addressClaims(PostalAddress address) {
        Map<String, Object> values = new LinkedHashMap<>();
        put(values, "street_address", address.streetAddress());
        put(values, "locality", address.locality());
        put(values, "region", address.region());
        put(values, "postal_code", address.postalCode());
        put(values, "country", address.country());
        return Map.copyOf(values);
    }

    private static void put(Map<String, Object> claims, String name, Object value) {
        if (value != null) {
            claims.put(name, value instanceof java.time.LocalDate date ? date.toString() : value);
        }
    }
}
