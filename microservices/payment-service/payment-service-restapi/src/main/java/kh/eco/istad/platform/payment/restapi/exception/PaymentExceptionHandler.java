package kh.eco.istad.platform.payment.restapi.exception;

import kh.eco.istad.common.restapi.exception.ApiError;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Map;
import java.util.Locale;

@RestControllerAdvice
public class PaymentExceptionHandler {
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiError> invalid(IllegalArgumentException e) {
        String message = e.getMessage() == null ? "Invalid payment operation" : e.getMessage();
        String normalizedMessage = message.toLowerCase(Locale.ROOT);
        boolean insufficientCredit = normalizedMessage.contains("insufficient")
                || normalizedMessage.contains("enough credit");
        HttpStatus status = insufficientCredit ? HttpStatus.UNPROCESSABLE_ENTITY : HttpStatus.CONFLICT;
        return ResponseEntity.status(status).body(new ApiError(status.value(), message, Map.of(), Instant.now()));
    }
}
