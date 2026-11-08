package kh.eco.istad.platform.authorization.domain.dto.user.command;

public record ChangePasswordCommand(
        String currentPassword,
        String newPassword,
        String confirmPassword
) {
}
