package kh.eco.istad.platform.authorization.domain.dto.role.command;

public record RoleFilterQuery(
        String keyword,
        Boolean active
) {
}
