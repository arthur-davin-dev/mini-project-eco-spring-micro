package kh.eco.istad.iamservice.config;

import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.oidc.OidcUserInfo;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class FederatedOidcUserService implements OAuth2UserService<OidcUserRequest, OidcUser> {
    private final FederatedUserMapper mapper;
    private final FederatedLinkIntent linkIntent;
    private final OidcUserService delegate = new OidcUserService();

    @Override
    public OidcUser loadUser(OidcUserRequest request) {
        var registrationId = request.getClientRegistration().getRegistrationId();
        var idToken = request.getIdToken();
        var providerClaims =
            "telegram".equals(registrationId) ? idToken.getClaims() : delegate.loadUser(request).getClaims();
        var targetUser = linkIntent.targetForCurrentRequest();
        FederatedUserMapper.MappedUser mapped;
        try {
            mapped = targetUser == null ? mapper.provision(registrationId, providerClaims)
                                        : mapper.link(registrationId, providerClaims, targetUser);
        } catch (kh.eco.istad.platform.authorization.domain.exception.ConflictException exception) {
            throw new OAuth2AuthenticationException(
                    new OAuth2Error("access_denied", exception.getMessage(), null), exception.getMessage(), exception);
        }
        if (targetUser != null) {
            linkIntent.clearCurrentRequest();
        }
        return new DefaultOidcUser(
            mapped.authorities(), idToken, new OidcUserInfo(mapped.attributes()), "iam_username");
    }
}
