package kh.eco.istad.platform.authorization.domain.entity.user;

import kh.eco.istad.platform.authorization.domain.exception.DomainException;
import kh.eco.istad.platform.authorization.domain.valueobject.PostalAddress;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Set;
import java.util.regex.Pattern;

public record UserProfile(
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
    private static final Set<String> LOCALES = Set.of("en", "km");
    private static final Set<String> GENDERS = Set.of("female", "male", "other");
    private static final Pattern E164 = Pattern.compile("^\\+[1-9]\\d{6,14}$");
    public UserProfile {
        givenName = requireText(givenName, "Given name", 100);
        familyName = requireText(familyName, "Family name", 100);
        middleName = optionalText(middleName, "Middle name", 100);
        nickname = optionalText(nickname, "Nickname", 100);
        gender = optionalText(gender, "Gender", 20);
        if (gender != null) {
            gender = gender.toLowerCase(java.util.Locale.ROOT);
        }
        if (gender != null && !GENDERS.contains(gender)) {
            throw new DomainException("Gender must be one of " + GENDERS);
        }
        if (birthdate != null && birthdate.isAfter(LocalDate.now())) {
            throw new DomainException("Birthdate cannot be in the future");
        }
        phoneNumber = optionalText(phoneNumber, "Phone number", 20);
        if (phoneNumber != null && !E164.matcher(phoneNumber).matches()) {
            throw new DomainException("Phone number must be in E.164 format, e.g. +85512345678");
        }
        zoneinfo = optionalText(zoneinfo, "Time zone", 50);
        if (zoneinfo != null) {
            try {
                ZoneId.of(zoneinfo);
            } catch (RuntimeException e) {
                throw new DomainException("Unknown time zone: " + zoneinfo);
            }
        }
        if (locale == null || !LOCALES.contains(locale)) {
            throw new DomainException("Locale must be one of " + LOCALES);
        }
        pictureUrl = optionalText(pictureUrl, "Picture URL", 500);
        websiteUrl = optionalText(websiteUrl, "Website URL", 500);
        profileUrl = optionalText(profileUrl, "Profile URL", 500);
    }

    public String fullName() {
        return givenName + " " + familyName;
    }

    private static String requireText(String value, String field, int maxLength) {
        if (value == null || value.isBlank()) {
            throw new DomainException(field + " must not be blank");
        }
        return requireMaxLength(value.trim(), field, maxLength);
    }

    private static String optionalText(String value, String field, int maxLength) {
        return value == null || value.isBlank() ? null : requireMaxLength(value.trim(), field, maxLength);
    }

    private static String requireMaxLength(String value, String field, int maxLength) {
        if (value.length() > maxLength) {
            throw new DomainException(field + " must be at most " + maxLength + " characters");
        }
        return value;
    }
}
