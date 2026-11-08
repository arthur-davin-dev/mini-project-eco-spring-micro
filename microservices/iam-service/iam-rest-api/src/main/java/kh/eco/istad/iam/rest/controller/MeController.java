package kh.eco.istad.iam.rest.controller;

import jakarta.validation.Valid;
import kh.eco.istad.platform.authorization.domain.usecase.identity.ListUserIdentitiesUseCase;
import kh.eco.istad.platform.authorization.domain.usecase.identity.UnlinkIdentityUseCase;
import kh.eco.istad.platform.authorization.domain.usecase.user.ChangePasswordUseCase;
import kh.eco.istad.platform.authorization.domain.usecase.user.GetUserUseCase;
import kh.eco.istad.platform.authorization.domain.usecase.user.UpdateUserProfileUseCase;
import kh.eco.istad.iam.rest.dto.Responses.IdentityResponse;
import kh.eco.istad.iam.rest.dto.Responses.UserResponse;
import kh.eco.istad.iam.rest.dto.UserRequests.ChangePasswordRequest;
import kh.eco.istad.iam.rest.dto.UserRequests.UpdateUserProfileRequest;
import kh.eco.istad.iam.rest.mapper.RestMapper;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/me")
public class MeController {

    private final GetUserUseCase getUser;
    private final UpdateUserProfileUseCase updateProfile;
    private final ChangePasswordUseCase changePassword;
    private final ListUserIdentitiesUseCase listIdentities;
    private final UnlinkIdentityUseCase unlinkIdentity;

    public MeController(GetUserUseCase getUser, UpdateUserProfileUseCase updateProfile,
                        ChangePasswordUseCase changePassword, ListUserIdentitiesUseCase listIdentities,
                        UnlinkIdentityUseCase unlinkIdentity) {
        this.getUser = getUser;
        this.updateProfile = updateProfile;
        this.changePassword = changePassword;
        this.listIdentities = listIdentities;
        this.unlinkIdentity = unlinkIdentity;
    }

    @GetMapping
    public UserResponse me(@AuthenticationPrincipal Jwt jwt) {
        return RestMapper.toResponse(getUser.execute(currentUser(jwt)));
    }

    @PatchMapping
    public UserResponse updateMe(@AuthenticationPrincipal Jwt jwt,
                                 @Valid @RequestBody UpdateUserProfileRequest request) {
        return RestMapper.toResponse(updateProfile.execute(currentUser(jwt), RestMapper.toCommand(request)));
    }

    @PutMapping("/password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void changePassword(@AuthenticationPrincipal Jwt jwt,
                               @Valid @RequestBody ChangePasswordRequest request) {
        changePassword.execute(currentUser(jwt), RestMapper.toCommand(request));
    }

    @GetMapping("/identities")
    public List<IdentityResponse> identities(@AuthenticationPrincipal Jwt jwt) {
        return listIdentities.execute(currentUser(jwt)).stream().map(RestMapper::toResponse).toList();
    }

    @DeleteMapping("/identities/{identityUuid}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void unlinkIdentity(@AuthenticationPrincipal Jwt jwt, @PathVariable("identityUuid") UUID identityUuid) {
        unlinkIdentity.execute(currentUser(jwt), identityUuid);
    }

    private static UUID currentUser(Jwt jwt) {
        return UUID.fromString(jwt.getSubject());
    }
}
