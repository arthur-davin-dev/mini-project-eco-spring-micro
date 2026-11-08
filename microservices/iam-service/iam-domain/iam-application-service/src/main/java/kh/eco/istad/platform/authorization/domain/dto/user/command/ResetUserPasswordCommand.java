package kh.eco.istad.platform.authorization.domain.dto.user.command;

public record ResetUserPasswordCommand(
        String newPassword,
        String confirmPassword
) {
}
