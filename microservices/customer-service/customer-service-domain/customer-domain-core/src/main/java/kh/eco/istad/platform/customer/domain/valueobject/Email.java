package kh.eco.istad.platform.customer.domain.valueobject;

import kh.eco.istad.platform.customer.domain.exception.CustomerDomainException;

import java.util.Locale;
import java.util.regex.Pattern;

public record Email(String value) {

    private static final Pattern PATTERN = Pattern.compile("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");

    public Email {
        if (value == null || !PATTERN.matcher(value.trim()).matches()) {
            throw new CustomerDomainException("Email is not valid");
        }
        value = value.trim().toLowerCase(Locale.ROOT);
    }
}