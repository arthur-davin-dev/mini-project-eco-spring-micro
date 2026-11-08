package kh.eco.istad.platform.authorization.domain.dto.permission.command;

public record CreatePermissionCommand(
        String resource,
        String action,
        String description
) {
}
