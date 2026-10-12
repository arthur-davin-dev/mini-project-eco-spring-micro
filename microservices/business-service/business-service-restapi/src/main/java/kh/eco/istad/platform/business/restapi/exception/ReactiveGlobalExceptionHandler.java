package kh.eco.istad.platform.business.restapi.exception;

import kh.eco.istad.common.domain.exception.ResourceNotFoundException;
import kh.eco.istad.platform.business.domain.exception.BusinessAlreadyExistsException;
import kh.eco.istad.platform.business.domain.exception.BusinessDomainException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.bind.support.WebExchangeBindException;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.server.ServerWebInputException;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class ReactiveGlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(ReactiveGlobalExceptionHandler.class);

    @ExceptionHandler(WebExchangeBindException.class)
    public ResponseEntity<ApiError> validation(WebExchangeBindException ex) {
        Map<String, String> errors = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(error -> errors.putIfAbsent(error.getField(), error.getDefaultMessage()));
        return response(HttpStatus.BAD_REQUEST, "Validation failed", errors);
    }

    @ExceptionHandler(ServerWebInputException.class)
    public ResponseEntity<ApiError> unreadable(ServerWebInputException ex) {
        return response(HttpStatus.BAD_REQUEST, "Malformed JSON request or invalid field value");
    }

    @ExceptionHandler(BusinessAlreadyExistsException.class)
    public ResponseEntity<ApiError> alreadyExists(BusinessAlreadyExistsException ex) {
        return response(HttpStatus.CONFLICT, ex.getMessage());
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiError> notFound(ResourceNotFoundException ex) {
        return response(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(BusinessDomainException.class)
    public ResponseEntity<ApiError> domain(BusinessDomainException ex) {
        return response(HttpStatus.UNPROCESSABLE_ENTITY, ex.getMessage());
    }

    @ExceptionHandler(DuplicateKeyException.class)
    public ResponseEntity<ApiError> duplicateKey(DuplicateKeyException ex) {
        return response(HttpStatus.CONFLICT, "A record with the same unique value already exists");
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ApiError> responseStatus(ResponseStatusException ex) {
        String message = ex.getReason() != null ? ex.getReason() : "Request failed";
        return response(ex.getStatusCode(), message);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> unexpected(Exception ex) {
        log.error("Unhandled REST API exception", ex);
        return response(HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred");
    }

    private ResponseEntity<ApiError> response(HttpStatusCode status, String message) {
        return response(status, message, Map.of());
    }

    private ResponseEntity<ApiError> response(HttpStatusCode status, String message, Map<String, String> errors) {
        return ResponseEntity.status(status)
                .body(new ApiError(status.value(), message, errors, Instant.now()));
    }
}