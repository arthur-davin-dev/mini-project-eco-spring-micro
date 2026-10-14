package kh.eco.istad.common.domain.exception;

/** Indicates that a valid operation conflicts with the current resource state. */
public class ConflictException extends DomainException {
    public ConflictException(String message) {
        super(message);
    }
}
