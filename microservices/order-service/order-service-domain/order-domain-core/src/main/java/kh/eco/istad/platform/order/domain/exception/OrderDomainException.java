package kh.eco.istad.platform.order.domain.exception;

import kh.eco.istad.common.domain.exception.DomainException;

public class OrderDomainException extends DomainException {
    public OrderDomainException(String message) {
        super(message);
    }
    public OrderDomainException(String message, Throwable cause){
        super(message,cause);
    }
}
