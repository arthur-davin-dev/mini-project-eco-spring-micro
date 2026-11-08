package kh.eco.istad.platform.authorization.domain.valueobject;

import kh.eco.istad.platform.authorization.domain.exception.DomainException;

import java.util.regex.Pattern;

public record Username(String value) {

    private static final Pattern PATTERN = Pattern.compile("^[A-Za-z0-9._-]{3,50}$");

    public Username {
        if (value == null || !PATTERN.matcher(value.trim()).matches()) {
            throw new DomainException("Username must be 3-50 characters: letters, digits, '.', '_' or '-'");
        }
        value = value.trim();
    }
}
