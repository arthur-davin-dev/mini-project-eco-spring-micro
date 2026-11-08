package kh.eco.istad.iamservice.web;

import java.util.List;
import java.util.Objects;
import kh.eco.istad.iam.web.controller.ConnectedApplicationView;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationConsent;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationConsentService;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
public class ConsentAndApplicationsController {
    private final RegisteredClientRepository registeredClients;
    private final OAuth2AuthorizationConsentService consents;
    private final JdbcTemplate jdbc;

    public ConsentAndApplicationsController(
        RegisteredClientRepository registeredClients, OAuth2AuthorizationConsentService consents, JdbcTemplate jdbc) {
        this.registeredClients = registeredClients;
        this.consents = consents;
        this.jdbc = jdbc;
    }

    @GetMapping("/oauth2/consent")
    public String consent(@RequestParam(name = "client_id", required = false) String clientId,
        @RequestParam(name = "state", required = false) String state,
        @RequestParam(name = "scope", required = false) List<String> scope, Model model) {
        if (clientId == null || clientId.isBlank() || state == null || state.isBlank()) {
            model.addAttribute("errorKey", "consent.invalidRequest");
            model.addAttribute("clientId", null);
            model.addAttribute("clientName", null);
            model.addAttribute("state", null);
            model.addAttribute("scopes", List.of());
            return "consent";
        }
        RegisteredClient client = registeredClients.findByClientId(clientId);
        if (client == null) {
            model.addAttribute("errorKey", "consent.invalidRequest");
            model.addAttribute("clientId", null);
            model.addAttribute("clientName", null);
            model.addAttribute("state", null);
            model.addAttribute("scopes", List.of());
            return "consent";
        }
        model.addAttribute("clientId", clientId);
        model.addAttribute(
            "clientName", client == null || client.getClientName() == null ? clientId : client.getClientName());
        model.addAttribute("state", state);
        model.addAttribute("scopes", scope == null ? List.of() : scope);
        return "consent";
    }

    @GetMapping("/profile/apps")
    public String connectedApps(Authentication authentication, Model model) {
        String principalName = authentication.getName();
        List<String> clientIds =
            jdbc.query("select registered_client_id from oauth2_authorization_consent where principal_name = ?",
                (row, rowNumber) -> row.getString("registered_client_id"), principalName);
        List<ConnectedApplicationView> apps =
            clientIds.stream().map(clientId -> application(clientId, principalName)).filter(Objects::nonNull).toList();
        model.addAttribute("apps", apps);
        return "connected-apps";
    }

    @PostMapping("/profile/apps/{registeredClientId}/revoke")
    public String revoke(
        Authentication authentication, @PathVariable String registeredClientId, RedirectAttributes flash) {
        OAuth2AuthorizationConsent consent = consents.findById(registeredClientId, authentication.getName());
        if (consent != null) {
            consents.remove(consent);
            flash.addFlashAttribute("successKey", "apps.revoked");
        }
        return "redirect:/profile/apps";
    }

    private ConnectedApplicationView application(String clientId, String principalName) {
        OAuth2AuthorizationConsent consent = consents.findById(clientId, principalName);
        RegisteredClient client = registeredClients.findById(clientId);
        if (consent == null || client == null) {
            return null;
        }
        List<String> scopes = consent.getAuthorities()
                                  .stream()
                                  .map(authority -> authority.getAuthority())
                                  .filter(authority -> authority.startsWith("SCOPE_"))
                                  .map(authority -> authority.substring("SCOPE_".length()))
                                  .sorted()
                                  .toList();
        return new ConnectedApplicationView(clientId, client.getClientName(), scopes);
    }
}
