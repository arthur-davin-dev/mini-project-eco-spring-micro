package kh.eco.istad.platform.order.domain.exception;

public class PaymentRejectedException extends RuntimeException {

    public PaymentRejectedException(String message) {
        super(message);
    }
}
