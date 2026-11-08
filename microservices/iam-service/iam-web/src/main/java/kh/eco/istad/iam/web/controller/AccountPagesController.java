package kh.eco.istad.iam.web.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import kh.eco.istad.platform.authorization.domain.dto.identity.result.IdentityResult;
import kh.eco.istad.platform.authorization.domain.dto.user.command.ChangePasswordCommand;
import kh.eco.istad.platform.authorization.domain.dto.user.command.RegisterUserCommand;
import kh.eco.istad.platform.authorization.domain.dto.user.command.UpdateUserProfileCommand;
import kh.eco.istad.platform.authorization.domain.dto.user.result.AuthUserResult;
import kh.eco.istad.platform.authorization.domain.dto.user.result.UserAuthoritiesResult;
import kh.eco.istad.platform.authorization.domain.dto.user.result.UserResult;
import kh.eco.istad.platform.authorization.domain.exception.PhoneNumberConflictException;
import kh.eco.istad.platform.authorization.domain.usecase.identity.ListUserIdentitiesUseCase;
import kh.eco.istad.platform.authorization.domain.usecase.identity.UnlinkIdentityUseCase;
import kh.eco.istad.platform.authorization.domain.usecase.user.ChangePasswordUseCase;
import kh.eco.istad.platform.authorization.domain.usecase.user.GetUserAuthoritiesUseCase;
import kh.eco.istad.platform.authorization.domain.usecase.user.GetUserUseCase;
import kh.eco.istad.platform.authorization.domain.usecase.user.LoadUserForAuthenticationUseCase;
import kh.eco.istad.platform.authorization.domain.usecase.user.RegisterUserUseCase;
import kh.eco.istad.platform.authorization.domain.usecase.user.UpdateUserProfileUseCase;
import kh.eco.istad.platform.authorization.domain.valueobject.PostalAddress;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
public class AccountPagesController {
    private static final Logger log = LoggerFactory.getLogger(AccountPagesController.class);
    private final ClientRegistrationRepository clientRegistrations;
    private final LoadUserForAuthenticationUseCase loadUser;
    private final RegisterUserUseCase registerUser;
    private final GetUserUseCase getUser;
    private final GetUserAuthoritiesUseCase getAuthorities;
    private final UpdateUserProfileUseCase updateProfile;
    private final ChangePasswordUseCase changePassword;
    private final ListUserIdentitiesUseCase listIdentities;
    private final UnlinkIdentityUseCase unlinkIdentity;

    public AccountPagesController(ClientRegistrationRepository clientRegistrations,
                                  LoadUserForAuthenticationUseCase loadUser, RegisterUserUseCase registerUser, GetUserUseCase getUser,
                                  GetUserAuthoritiesUseCase getAuthorities, UpdateUserProfileUseCase updateProfile,
                                  ChangePasswordUseCase changePassword, ListUserIdentitiesUseCase listIdentities,
                                  UnlinkIdentityUseCase unlinkIdentity) {
        this.clientRegistrations = clientRegistrations;
        this.loadUser = loadUser;
        this.registerUser = registerUser;
        this.getUser = getUser;
        this.getAuthorities = getAuthorities;
        this.updateProfile = updateProfile;
        this.changePassword = changePassword;
        this.listIdentities = listIdentities;
        this.unlinkIdentity = unlinkIdentity;
    }

    @GetMapping("/login")
    public String login(
            @RequestParam(name = "error", required = false)
            String error,
            @RequestParam(name = "oauth_error", required = false)
            String oauthError,
            @RequestParam(name = "registered", required = false)
            String registered, Model model) {
        model.addAttribute("githubEnabled", enabled("github"));
        model.addAttribute("googleEnabled", enabled("google"));
        model.addAttribute("facebookEnabled", enabled("facebook"));
        model.addAttribute("telegramEnabled", enabled("telegram"));
        model.addAttribute("badCredentials", error != null);
        model.addAttribute("oauthError", oauthError != null);
        model.addAttribute("registered", registered != null);
        return "login";
    }

    @GetMapping("/register")
    public String registerPage() {
        return "register";
    }

    @PostMapping("/register")
    public String register(
            @RequestParam("username")
            String username,
            @RequestParam("email")
            String email,
            @RequestParam("givenName")
            String givenName,
            @RequestParam("familyName")
            String familyName,
            @RequestParam("password")
            String password,
            @RequestParam("confirmPassword")
            String confirmPassword,
            @RequestParam(name = "locale", defaultValue = "en")
            String locale, Model model) {
        try {
            registerUser.execute(
                    new RegisterUserCommand(username, email, password, confirmPassword, givenName, familyName, locale));
            return "redirect:/login?registered";
        } catch (RuntimeException exception) {
            model.addAttribute("formError", "common.validationError");
            return "register";
        }
    }

    @GetMapping("/")
    public String profile(Authentication authentication, Model model) {
        UUID userId = currentUser(authentication).uuid();
        UserResult user = getUser.execute(userId);
        UserAuthoritiesResult authorities = getAuthorities.execute(userId);
        model.addAttribute("user", user);
        model.addAttribute("authorities", authorities);
        return "index";
    }

    @GetMapping("/profile/edit")
    public String editProfile(Authentication authentication, Model model) {
        model.addAttribute("user", getUser.execute(currentUser(authentication).uuid()));
        return "profile-edit";
    }

    @PostMapping("/profile/edit")
    public String updateProfile(
            Authentication authentication,
            @RequestParam("givenName") String givenName,
            @RequestParam("familyName") String familyName,
            @RequestParam(name = "middleName", required = false) String middleName,
            @RequestParam(name = "nickname", required = false) String nickname,
            @RequestParam(name = "gender", required = false) String gender,
            @RequestParam(name = "birthdate", required = false) String birthdate,
            @RequestParam(name = "phoneNumber", required = false) String phoneNumber,
            @RequestParam(name = "pictureUrl", required = false) String pictureUrl,
            @RequestParam(name = "websiteUrl", required = false) String websiteUrl,
            @RequestParam(name = "profileUrl", required = false) String profileUrl,
            @RequestParam(name = "zoneinfo", required = false) String zoneinfo,
            @RequestParam(name = "locale", defaultValue = "en") String locale,
            @RequestParam(name = "streetAddress", required = false) String streetAddress,
            @RequestParam(name = "locality", required = false) String locality,
            @RequestParam(name = "region", required = false) String region,
            @RequestParam(name = "postalCode", required = false) String postalCode,
            @RequestParam(name = "country", required = false) String country, RedirectAttributes flash) {
        try {
            LocalDate parsedBirthdate = birthdate == null || birthdate.isBlank() ? null : LocalDate.parse(birthdate);
            updateProfile.execute(currentUser(authentication).uuid(),
                    new UpdateUserProfileCommand(givenName, familyName, middleName, nickname, gender, parsedBirthdate,
                            phoneNumber, pictureUrl, websiteUrl, profileUrl, zoneinfo, locale,
                            new PostalAddress(streetAddress, locality, region, postalCode, country)));
            flash.addFlashAttribute("successKey", "profile.saved");
            return "redirect:/profile/edit";
        } catch (PhoneNumberConflictException exception) {
            flash.addFlashAttribute("errorKey", "profile.phoneTaken");
            return "redirect:/profile/edit";
        } catch (RuntimeException exception) {
            log.warn("Profile update failed", exception);
            flash.addFlashAttribute("errorKey", "common.validationError");
            if (exception.getMessage() != null && !exception.getMessage().isBlank()) {
                flash.addFlashAttribute("errorMessage", exception.getMessage());
            }
            return "redirect:/profile/edit";
        }
    }

    @GetMapping("/profile/password")
    public String passwordPage() {
        return "change-password";
    }

    @PostMapping("/profile/password")
    public String password(Authentication authentication, @RequestParam("currentPassword") String currentPassword,
                           @RequestParam("newPassword") String newPassword, @RequestParam("confirmPassword") String confirmPassword,
                           RedirectAttributes flash) {
        try {
            changePassword.execute(currentUser(authentication).uuid(),
                    new ChangePasswordCommand(currentPassword, newPassword, confirmPassword));
            flash.addFlashAttribute("successKey", "password.saved");
            return "redirect:/profile/password";
        } catch (RuntimeException exception) {
            flash.addFlashAttribute("errorKey", "password.failed");
            return "redirect:/profile/password";
        }
    }

    @GetMapping("/profile/accounts")
    public String linkedAccounts(Authentication authentication,
                                 @RequestParam(name = "link_error", required = false) String linkError,
                                 Model model) {
        List<IdentityResult> identities = listIdentities.execute(currentUser(authentication).uuid());
        model.addAttribute("identities", identities);
        Set<String> connected =
                identities.stream().map(identity -> identity.provider().name().toLowerCase()).collect(Collectors.toSet());
        model.addAttribute("linkableProviders",
                List.of("google", "github", "facebook", "telegram")
                        .stream()
                        .filter(this::enabled)
                        .filter(provider -> !connected.contains(provider))
                        .toList());
        if (linkError != null) {
            model.addAttribute("errorKey", "already_linked".equals(linkError)
                    ? "accounts.alreadyLinked" : "accounts.linkFailed");
        }
        return "linked-accounts";
    }

    @PostMapping("/profile/accounts/{identityId}/unlink")
    public String unlink(Authentication authentication, @PathVariable UUID identityId, RedirectAttributes flash) {
        try {
            unlinkIdentity.execute(currentUser(authentication).uuid(), identityId);
            flash.addFlashAttribute("successKey", "accounts.unlinked");
        } catch (RuntimeException exception) {
            flash.addFlashAttribute("errorKey", "accounts.unlinkFailed");
        }
        return "redirect:/profile/accounts";
    }

    private boolean enabled(String registrationId) {
        return clientRegistrations.findByRegistrationId(registrationId) != null;
    }

    private AuthUserResult currentUser(Authentication authentication) {
        return loadUser.execute(authentication.getName())
                .orElseThrow(() -> new IllegalStateException("Authenticated IAM user was not found"));
    }
}
