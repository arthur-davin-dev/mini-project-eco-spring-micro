package kh.eco.istad.iam.web.controller;

import jakarta.servlet.http.HttpServletRequest;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ModelAttribute;

@ControllerAdvice
public class ViewModelAdvice {
    private static final List<String> MESSAGE_KEYS = List.of(
            "common.appName", "common.home", "common.edit",
            "common.save", "common.cancel", "locale.en", "locale.km", "common.logout", "common.language",
            "common.validationError", "common.empty", "login.title", "login.subtitle", "login.username", "login.password",
            "login.signIn", "login.register", "login.continueWith", "login.orContinue", "login.badCredentials",
            "login.registered", "login.oauthError", "register.title", "register.givenName", "register.familyName",
            "register.email", "register.confirmPassword", "register.submit", "profile.title", "profile.email",
            "profile.username", "profile.roles", "profile.permissions", "profile.edit", "profile.linkedAccounts",
            "profile.connectedApps", "profile.saved", "profile.phoneTaken", "edit.title", "edit.middleName", "edit.nickname", "edit.gender",
            "edit.birthdate", "edit.phone", "edit.picture", "edit.website", "edit.profileUrl", "edit.zoneinfo",
            "edit.locale", "edit.street", "edit.locality", "edit.region", "edit.postalCode", "edit.country",
            "password.title", "password.current", "password.new", "password.confirm", "password.submit", "password.saved",
            "password.failed", "accounts.title", "accounts.provider", "accounts.email", "accounts.linkedAt",
            "accounts.unlink", "accounts.unlinked", "accounts.unlinkFailed", "accounts.link", "accounts.linkFailed",
            "accounts.alreadyLinked",
            "apps.title", "apps.client", "apps.scopes", "apps.revoke", "apps.revoked", "consent.title", "consent.allow",
            "consent.cancel", "consent.client", "consent.requestedScopes", "consent.noScopes",
            "consent.invalidRequest");

    private final MessageSource messages;

    public ViewModelAdvice(MessageSource messages) {
        this.messages = messages;
    }

    @ModelAttribute
    public void addCommonViewModel(Model model, HttpServletRequest request) {
        Map<String, String> localized = new LinkedHashMap<>();
        for (String key : MESSAGE_KEYS) {
            localized.put(key, messages.getMessage(key, null, key, LocaleContextHolder.getLocale()));
        }
        model.addAttribute("i18n", localized);
        Object csrfToken = request.getAttribute(CsrfToken.class.getName());
        if (csrfToken instanceof CsrfToken token) {
            model.addAttribute("csrf", token);
        }
        model.addAttribute("currentLanguage", LocaleContextHolder.getLocale().getLanguage());
        model.addAttribute("formError", null);
        model.addAttribute("successKey", null);
        model.addAttribute("errorKey", null);
        model.addAttribute("oauthError", false);
        model.addAttribute("registered", false);
        model.addAttribute("badCredentials", false);
    }
}
