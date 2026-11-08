package kh.eco.istad.iamservice.config;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
@RequiredArgsConstructor
public class FederatedOAuth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {
    private final FederatedUserMapper mapper;
    private final FederatedLinkIntent linkIntent;
    private final DefaultOAuth2UserService delegate = new DefaultOAuth2UserService();
    private final RestClient restClient = RestClient.create();

    @Override
    public OAuth2User loadUser(OAuth2UserRequest request) {
        OAuth2User providerUser = delegate.loadUser(request);
        Map<String, Object> attributes = new LinkedHashMap<>(providerUser.getAttributes());
        if ("github".equals(request.getClientRegistration().getRegistrationId()) && attributes.get("email") == null) {
            githubVerifiedEmail(request).ifPresent(email -> {
                attributes.put("email", email);
                attributes.put("email_verified", true);
            });
        }
        var registrationId = request.getClientRegistration().getRegistrationId();
        var targetUser = linkIntent.targetForCurrentRequest();
        FederatedUserMapper.MappedUser mapped;
        try {
            mapped = targetUser == null ? mapper.provision(registrationId, attributes)
                                        : mapper.link(registrationId, attributes, targetUser);
        } catch (kh.eco.istad.platform.authorization.domain.exception.ConflictException exception) {
            throw new OAuth2AuthenticationException(
                    new OAuth2Error("access_denied", exception.getMessage(), null), exception.getMessage(), exception);
        }
        if (targetUser != null) {
            linkIntent.clearCurrentRequest();
        }
        return new DefaultOAuth2User(mapped.authorities(), mapped.attributes(), "iam_username");
    }

    private java.util.Optional<String> githubVerifiedEmail(OAuth2UserRequest request) {
        List<Map<String, Object>> emails =
            restClient.get()
                .uri("https://api.github.com/user/emails")
                .headers(headers -> headers.setBearerAuth(request.getAccessToken().getTokenValue()))
                .retrieve()
                .body(new org.springframework.core.ParameterizedTypeReference<>() {});
        if (emails == null)
            return java.util.Optional.empty();
        return emails.stream()
            .filter(email -> Boolean.TRUE.equals(email.get("verified")))
            .sorted((left, right)
                        -> Boolean.compare(
                            Boolean.TRUE.equals(right.get("primary")), Boolean.TRUE.equals(left.get("primary"))))
            .map(email -> email.get("email"))
            .map(Object::toString)
            .findFirst();
    }
}
