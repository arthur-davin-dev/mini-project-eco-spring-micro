package kh.eco.istad.platform.authorization.domain.exception;

public final class PhoneNumberConflictException extends DomainException {

    private static final long serialVersionUID = 1L;

    public PhoneNumberConflictException() {
        super("Phone number is already used by another account");
    }
}
