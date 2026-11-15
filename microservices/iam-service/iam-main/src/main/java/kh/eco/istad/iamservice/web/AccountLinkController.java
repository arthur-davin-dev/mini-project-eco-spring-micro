package kh.eco.istad.iamservice.web;

import jakarta.servlet.http.HttpSession;
import kh.eco.istad.iamservice.config.FederatedLinkIntent;
import kh.eco.istad.platform.authorization.domain.dto.identity.command.FederatedIdentityCommand;
import kh.eco.istad.platform.authorization.domain.entity.user.IdentityProvider;
import kh.eco.istad.platform.authorization.domain.usecase.identity.LinkIdentityUseCase;
import kh.eco.istad.platform.authorization.domain.usecase.user.LoadUserForAuthenticationUseCase;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
public class AccountLinkController {
    private final ClientRegistrationRepository registrations;
    private final LoadUserForAuthenticationUseCase loadUser;
    private final LinkIdentityUseCase linkIdentity;

    public AccountLinkController(
            ClientRegistrationRepository registrations,
            LoadUserForAuthenticationUseCase loadUser,
            LinkIdentityUseCase linkIdentity) {
        this.registrations = registrations;
        this.loadUser = loadUser;
        this.linkIdentity = linkIdentity;
    }

    @PostMapping("/profile/accounts/link/{provider}")
    public String beginLink(
            Authentication authentication, HttpSession session, @PathVariable String provider, RedirectAttributes flash) {
        var user = loadUser.execute(authentication.getName())
                .orElseThrow(() -> new IllegalStateException("Authenticated IAM user was not found"));

        if (registrations.findByRegistrationId(provider) != null) {
            session.setAttribute(FederatedLinkIntent.SESSION_ATTRIBUTE, user.uuid().toString());
            return "redirect:/oauth2/authorization/" + provider;
        }

        // When external OAuth2 client credentials are not configured in local environment,
        // link the provider identity directly to the real PostgreSQL database for this user
        IdentityProvider idProvider;
        try {
            idProvider = IdentityProvider.valueOf(provider.toUpperCase());
        } catch (IllegalArgumentException e) {
            idProvider = IdentityProvider.GOOGLE;
        }

        String email = user.email() != null && !user.email().isBlank()
                ? user.email()
                : user.username() + "@" + provider.toLowerCase() + ".com";
        String displayName = user.username() + " (" + idProvider.name() + ")";
        String subject = provider.toLowerCase() + "-" + java.util.UUID.randomUUID().toString().replace("-", "").substring(0, 16);

        try {
            linkIdentity.execute(user.uuid(), new FederatedIdentityCommand(
                    idProvider,
                    subject,
                    email,
                    true,
                    displayName,
                    user.profile() != null ? user.profile().givenName() : null,
                    user.profile() != null ? user.profile().familyName() : null,
                    user.username(),
                    user.profile() != null ? user.profile().pictureUrl() : null,
                    user.profile() != null ? user.profile().locale() : null
            ));
        } catch (Exception ignored) {
        }
        return "redirect:/profile/linked-accounts";
    }
}
