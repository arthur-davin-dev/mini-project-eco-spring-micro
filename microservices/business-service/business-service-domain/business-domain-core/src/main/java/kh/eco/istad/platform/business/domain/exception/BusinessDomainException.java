package kh.eco.istad.platform.business.domain.exception;

import kh.eco.istad.common.domain.exception.DomainException;

public class BusinessDomainException extends DomainException {

    public BusinessDomainException(String message) {
        super(message);
    }

    public BusinessDomainException(String message, Throwable cause) {
        super(message, cause);
    }
}