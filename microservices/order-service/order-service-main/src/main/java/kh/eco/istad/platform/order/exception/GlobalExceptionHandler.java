package kh.eco.istad.platform.order.exception;

import kh.eco.istad.platform.order.client.exception.DownStreamServiceException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(DownStreamServiceException.class)
    public ResponseEntity<Map<String, Object>> handle(
            DownStreamServiceException ex
    ) {

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(
                        Map.of(
                                "status", HttpStatus.INTERNAL_SERVER_ERROR.value(),
                                "service", ex.getService(),
                                "error", "Downstream Service Error",
                                "message", ex.getMessage()
                        )
                );
    }
}