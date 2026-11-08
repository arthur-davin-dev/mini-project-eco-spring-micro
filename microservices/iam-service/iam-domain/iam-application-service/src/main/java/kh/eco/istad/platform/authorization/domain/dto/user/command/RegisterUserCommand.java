package kh.eco.istad.platform.authorization.domain.dto.user.command;

public record RegisterUserCommand(
        String username,
        String email,
        String password,
        String confirmPassword,
        String givenName,
        String familyName,
        String locale
) {
}
