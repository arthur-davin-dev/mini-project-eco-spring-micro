package kh.eco.istad.iam.web.controller;

import java.time.LocalDate;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import kh.eco.istad.platform.authorization.domain.dto.user.command.ChangePasswordCommand;
import kh.eco.istad.platform.authorization.domain.dto.user.command.RegisterUserCommand;
import kh.eco.istad.platform.authorization.domain.dto.user.command.UpdateUserProfileCommand;
import kh.eco.istad.platform.authorization.domain.dto.user.result.AuthUserResult;
import kh.eco.istad.platform.authorization.domain.exception.PhoneNumberConflictException;
import kh.eco.istad.platform.authorization.domain.usecase.identity.UnlinkIdentityUseCase;
import kh.eco.istad.platform.authorization.domain.usecase.user.ChangePasswordUseCase;
import kh.eco.istad.platform.authorization.domain.usecase.user.LoadUserForAuthenticationUseCase;
import kh.eco.istad.platform.authorization.domain.usecase.user.RegisterUserUseCase;
import kh.eco.istad.platform.authorization.domain.usecase.user.UpdateUserProfileUseCase;
import kh.eco.istad.platform.authorization.domain.valueobject.PostalAddress;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
public class AccountPagesController {
    private static final Logger log = LoggerFactory.getLogger(AccountPagesController.class);
    private final LoadUserForAuthenticationUseCase loadUser;
    private final RegisterUserUseCase registerUser;
    private final UpdateUserProfileUseCase updateProfile;
    private final ChangePasswordUseCase changePassword;
    private final UnlinkIdentityUseCase unlinkIdentity;

    public AccountPagesController(LoadUserForAuthenticationUseCase loadUser, RegisterUserUseCase registerUser,
                                  UpdateUserProfileUseCase updateProfile, ChangePasswordUseCase changePassword,
                                  UnlinkIdentityUseCase unlinkIdentity) {
        this.loadUser = loadUser;
        this.registerUser = registerUser;
        this.updateProfile = updateProfile;
        this.changePassword = changePassword;
        this.unlinkIdentity = unlinkIdentity;
    }

    @GetMapping("/login")
    public String login() {
        return "forward:/index.html";
    }

    @GetMapping("/register")
    public String registerPage() {
        return "forward:/index.html";
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
            String locale) {
        try {
            registerUser.execute(
                    new RegisterUserCommand(username, email, password, confirmPassword, givenName, familyName, locale));
            return "redirect:/login?registered";
        } catch (RuntimeException exception) {
            return "redirect:/register?error=validation";
        }
    }

    @GetMapping("/")
    public String profile() {
        return "redirect:/account";
    }

    @GetMapping("/profile/edit")
    public String editProfile() {
        return "redirect:/profile";
    }

    @GetMapping("/profile")
    public String viewProfile() {
        return "forward:/index.html";
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
        return "redirect:/profile/security";
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
    public String linkedAccounts() {
        return "redirect:/profile/linked-accounts";
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

    private AuthUserResult currentUser(Authentication authentication) {
        return loadUser.execute(authentication.getName())
                .orElseThrow(() -> new IllegalStateException("Authenticated IAM user was not found"));
    }
}
