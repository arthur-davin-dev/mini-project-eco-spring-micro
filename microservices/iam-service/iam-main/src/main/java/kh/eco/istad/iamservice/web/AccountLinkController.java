package kh.eco.istad.iamservice.web;

import jakarta.servlet.http.HttpSession;
import kh.eco.istad.iamservice.config.FederatedLinkIntent;
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

    public AccountLinkController(
        ClientRegistrationRepository registrations, LoadUserForAuthenticationUseCase loadUser) {
        this.registrations = registrations;
        this.loadUser = loadUser;
    }

    @PostMapping("/profile/accounts/link/{provider}")
    public String beginLink(
        Authentication authentication, HttpSession session, @PathVariable String provider, RedirectAttributes flash) {
        if (registrations.findByRegistrationId(provider) == null) {
            flash.addFlashAttribute("errorKey", "accounts.linkFailed");
            return "redirect:/profile/accounts";
        }
        var user = loadUser.execute(authentication.getName())
                       .orElseThrow(() -> new IllegalStateException("Authenticated IAM user was not found"));
        session.setAttribute(FederatedLinkIntent.SESSION_ATTRIBUTE, user.uuid().toString());
        return "redirect:/oauth2/authorization/" + provider;
    }
}
