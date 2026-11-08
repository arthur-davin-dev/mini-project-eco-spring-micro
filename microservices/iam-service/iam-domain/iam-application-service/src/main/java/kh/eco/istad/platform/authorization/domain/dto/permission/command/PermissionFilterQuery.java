package kh.eco.istad.platform.authorization.domain.dto.permission.command;

public record PermissionFilterQuery(
        String resource,
        String action,
        Boolean active
) {
}
