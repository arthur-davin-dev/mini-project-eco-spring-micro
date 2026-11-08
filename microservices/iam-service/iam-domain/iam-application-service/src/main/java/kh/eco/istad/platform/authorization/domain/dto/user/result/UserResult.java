package kh.eco.istad.platform.authorization.domain.dto.user.result;

import kh.eco.istad.platform.authorization.domain.dto.role.result.RoleRef;
import kh.eco.istad.platform.authorization.domain.valueobject.PostalAddress;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record UserResult(
        UUID uuid,
        String username,
        String email,
        boolean emailVerified,
        String name,
        String givenName,
        String familyName,
        String middleName,
        String nickname,
        String gender,
        LocalDate birthdate,
        String phoneNumber,
        String pictureUrl,
        String websiteUrl,
        String profileUrl,
        String zoneinfo,
        String locale,
        PostalAddress address,
        boolean enabled,
        boolean accountNonLocked,
        List<RoleRef> roles,
        Instant createdAt,
        Instant updatedAt
) {
    public UserResult {
        roles = List.copyOf(roles);
    }
}
