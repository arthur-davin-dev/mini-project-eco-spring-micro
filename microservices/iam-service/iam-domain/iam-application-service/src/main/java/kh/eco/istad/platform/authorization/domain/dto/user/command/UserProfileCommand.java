package kh.eco.istad.platform.authorization.domain.dto.user.command;

import kh.eco.istad.platform.authorization.domain.valueobject.PostalAddress;

import java.time.LocalDate;

public record UserProfileCommand(
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
        PostalAddress address
) {
}
