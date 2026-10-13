package kh.eco.istad.platform.customer.domain.valueobject;

import kh.eco.istad.platform.customer.domain.exception.CustomerDomainException;

import java.util.regex.Pattern;

public record PhoneNumber(String value) {

    private static final Pattern PATTERN = Pattern.compile("^\\+?[0-9]{8,15}$");

    public PhoneNumber {
        if (value == null || !PATTERN.matcher(value.trim()).matches()) {
            throw new CustomerDomainException("Phone number is not valid");
        }
        value = value.trim();
    }
}