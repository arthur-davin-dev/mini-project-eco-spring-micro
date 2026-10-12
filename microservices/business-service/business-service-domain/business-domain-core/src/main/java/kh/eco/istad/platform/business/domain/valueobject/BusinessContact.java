package kh.eco.istad.platform.business.domain.valueobject;

import kh.eco.istad.platform.business.domain.exception.BusinessDomainException;

import java.util.Locale;
import java.util.regex.Pattern;

public record BusinessContact(String email, String phoneNumber) {

    private static final Pattern EMAIL = Pattern.compile("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");
    private static final Pattern PHONE = Pattern.compile("^\\+?[0-9]{8,15}$");

    public BusinessContact {
        if (email == null || !EMAIL.matcher(email.trim()).matches()) {
            throw new BusinessDomainException("Email is not valid");
        }
        if (phoneNumber == null || !PHONE.matcher(phoneNumber.trim()).matches()) {
            throw new BusinessDomainException("Phone number is not valid");
        }
        email = email.trim().toLowerCase(Locale.ROOT);
        phoneNumber = phoneNumber.trim();
    }
}