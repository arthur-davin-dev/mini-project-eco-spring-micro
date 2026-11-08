package kh.eco.istad.iamservice.config;

import java.nio.charset.StandardCharsets;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;
import kh.eco.istad.platform.authorization.domain.dto.identity.command.FederatedIdentityCommand;
import kh.eco.istad.platform.authorization.domain.dto.user.result.AuthUserResult;
import kh.eco.istad.platform.authorization.domain.entity.user.IdentityProvider;
import kh.eco.istad.platform.authorization.domain.usecase.identity.FindOrProvisionFederatedUserUseCase;
import kh.eco.istad.platform.authorization.domain.usecase.identity.LinkIdentityUseCase;
import kh.eco.istad.platform.authorization.domain.usecase.user.GetUserUseCase;
import kh.eco.istad.platform.authorization.domain.usecase.user.LoadUserForAuthenticationUseCase;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.stereotype.Component;

@Component
public class FederatedUserMapper {
    private final FindOrProvisionFederatedUserUseCase findOrProvision;
    private final LinkIdentityUseCase linkIdentity;
    private final GetUserUseCase getUser;
    private final LoadUserForAuthenticationUseCase loadUser;

    public FederatedUserMapper(FindOrProvisionFederatedUserUseCase findOrProvision, LinkIdentityUseCase linkIdentity,
        GetUserUseCase getUser, LoadUserForAuthenticationUseCase loadUser) {
        this.findOrProvision = findOrProvision;
        this.linkIdentity = linkIdentity;
        this.getUser = getUser;
        this.loadUser = loadUser;
    }

    public MappedUser provision(String registrationId, Map<String, Object> attributes) {
        FederatedIdentityCommand command = identityCommand(registrationId, attributes);
        AuthUserResult result = findOrProvision.execute(command);
        return mapped(attributes, result);
    }

    public MappedUser link(String registrationId, Map<String, Object> attributes, UUID targetUserUuid) {
        linkIdentity.execute(targetUserUuid, identityCommand(registrationId, attributes));
        var target = getUser.execute(targetUserUuid);
        AuthUserResult result =
            loadUser.execute(target.username())
                .orElseThrow(() -> new IllegalStateException("Linked IAM user could not be reloaded"));
        return mapped(attributes, result);
    }

    private static MappedUser mapped(Map<String, Object> attributes, AuthUserResult result) {
        Map<String, Object> mappedAttributes = new LinkedHashMap<>(attributes);
        mappedAttributes.put("iam_username", result.username());
        Collection<SimpleGrantedAuthority> authorities =
            result.authorities().stream().map(SimpleGrantedAuthority::new).toList();
        return new MappedUser(mappedAttributes, authorities);
    }

    static FederatedIdentityCommand identityCommand(String registrationId, Map<String, Object> attributes) {
        IdentityProvider provider = switch (registrationId) {
            case "google" -> IdentityProvider.GOOGLE;
            case "github" -> IdentityProvider.GITHUB;
            case "facebook" -> IdentityProvider.FACEBOOK;
            case "telegram" -> IdentityProvider.TELEGRAM;
            default -> throw new IllegalArgumentException("Unsupported identity provider: " + registrationId);
        };
        String subjectClaim =
            provider == IdentityProvider.GOOGLE || provider == IdentityProvider.TELEGRAM ? "sub" : "id";
        String subject = text(attributes.get(subjectClaim));
        if (subject == null) {
            throw new OAuth2AuthenticationException(
                new OAuth2Error("invalid_user_info"), "The identity provider did not return a subject identifier");
        }
        String displayName =
            firstText(attributes.get("name"), attributes.get("preferred_username"), attributes.get("login"));
        String givenName = text(attributes.get("given_name"));
        String familyName = text(attributes.get("family_name"));
        String username = firstText(attributes.get("preferred_username"), attributes.get("login"));
        String picture = text(attributes.get("picture"));
        if (picture == null && attributes.get("avatar_url") != null) {
            picture = text(attributes.get("avatar_url"));
        }
        if (picture == null && attributes.get("picture") instanceof Map<?, ?> pictureObject) {
            Object data = pictureObject.get("data");
            if (data instanceof Map<?, ?> dataObject) {
                picture = text(dataObject.get("url"));
            }
        }
        String locale = text(attributes.get("locale"));
        String email = text(attributes.get("email"));
        boolean emailVerified = email != null && Boolean.TRUE.equals(attributes.get("email_verified"));
        if (provider == IdentityProvider.TELEGRAM && email == null) {
            String syntheticId =
                UUID.nameUUIDFromBytes(("telegram:" + subject).getBytes(StandardCharsets.UTF_8)).toString();
            email = "telegram-" + syntheticId + "@users.invalid";
        }
        FederatedIdentityCommand command = new FederatedIdentityCommand(
            provider, subject, email, emailVerified, displayName, givenName, familyName, username, picture, locale);
        return command;
    }

    private static String firstText(Object... values) {
        for (Object value : values) {
            String text = text(value);
            if (text != null)
                return text;
        }
        return null;
    }

    private static String text(Object value) {
        return value == null || value.toString().isBlank() ? null : value.toString();
    }

    public record MappedUser(Map<String, Object> attributes, Collection<SimpleGrantedAuthority> authorities) {
        public MappedUser {
            attributes = java.util.Collections.unmodifiableMap(new LinkedHashMap<>(attributes));
            authorities = java.util.List.copyOf(authorities);
        }
    }
}
