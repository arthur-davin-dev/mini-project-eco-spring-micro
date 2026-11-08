package kh.eco.istad.iam.rest.controller;

import jakarta.validation.Valid;
import kh.eco.istad.platform.authorization.domain.usecase.user.RegisterUserUseCase;
import kh.eco.istad.iam.rest.dto.Responses.UserResponse;
import kh.eco.istad.iam.rest.dto.UserRequests.RegisterUserRequest;
import kh.eco.istad.iam.rest.mapper.RestMapper;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AuthController {

    private final RegisterUserUseCase registerUser;

    public AuthController(RegisterUserUseCase registerUser) {
        this.registerUser = registerUser;
    }

    @PostMapping("/api/auth/register")
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse register(@Valid @RequestBody RegisterUserRequest request) {
        return RestMapper.toResponse(registerUser.execute(RestMapper.toCommand(request)));
    }
}
