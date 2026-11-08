package kh.eco.istad.platform.authorization.domain.dto.user.command;

public record UserFilterQuery(
        String keyword,
        Boolean enabled,
        Boolean locked
) {
}
