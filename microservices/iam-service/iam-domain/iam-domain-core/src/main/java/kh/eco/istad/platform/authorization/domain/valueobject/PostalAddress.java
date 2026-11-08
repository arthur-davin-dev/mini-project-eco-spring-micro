package kh.eco.istad.platform.authorization.domain.valueobject;

import kh.eco.istad.platform.authorization.domain.exception.DomainException;

import java.util.regex.Pattern;

public record PostalAddress(
        String streetAddress,
        String locality,
        String region,
        String postalCode,
        String country
) {
    private static final Pattern COUNTRY = Pattern.compile("^[A-Z]{2}$");

    public PostalAddress {
        streetAddress = boundedText(streetAddress, "Street address", 255);
        locality = boundedText(locality, "Locality", 100);
        region = boundedText(region, "Region", 100);
        postalCode = boundedText(postalCode, "Postal code", 20);
        country = boundedText(country, "Country", 2);
        if (country != null) {
            country = country.toUpperCase(java.util.Locale.ROOT);
        }
        if (country != null && !COUNTRY.matcher(country).matches()) {
            throw new DomainException("Country must be a two-letter ISO code, e.g. KH");
        }
    }

    private static String boundedText(String value, String field, int maxLength) {
        if (value == null || value.isBlank()) {
            return null;
        }
        String normalized = value.trim();
        if (normalized.length() > maxLength) {
            throw new DomainException(field + " must be at most " + maxLength + " characters");
        }
        return normalized;
    }
}
