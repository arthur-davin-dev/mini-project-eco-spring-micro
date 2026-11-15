package kh.eco.istad.platform.authorization.domain.dto.permission.command;

public record PermissionFilterQuery(
        String keyword,
        String resource,
        String action,
        Boolean active,
        Boolean system
) {
}
