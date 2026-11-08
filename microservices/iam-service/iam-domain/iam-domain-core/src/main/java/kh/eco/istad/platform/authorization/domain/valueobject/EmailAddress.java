package kh.eco.istad.platform.authorization.domain.valueobject;

import kh.eco.istad.platform.authorization.domain.exception.DomainException;

import java.util.Locale;
import java.util.regex.Pattern;

public record EmailAddress(String value) {

    private static final Pattern PATTERN = Pattern.compile("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$");

    public EmailAddress {
        if (value == null) {
            throw new DomainException("Email must not be null");
        }
        value = value.trim().toLowerCase(Locale.ROOT);
        if (value.length() > 255 || !PATTERN.matcher(value).matches()) {
            throw new DomainException("Email must be a well-formed email address");
        }
    }
}
