package kh.eco.istad.common.restapi.exception;

import kh.eco.istad.common.domain.exception.ConflictException;
import kh.eco.istad.common.domain.exception.DomainException;
import kh.eco.istad.common.domain.exception.ResourceNotFoundException;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import static org.junit.jupiter.api.Assertions.assertEquals;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void invalidArgumentMapsToBadRequest() {
        assertEquals(HttpStatus.BAD_REQUEST, handler.invalidArgument(new IllegalArgumentException("invalid")).getStatusCode());
    }

    @Test
    void missingResourceMapsToNotFound() {
        assertEquals(HttpStatus.NOT_FOUND, handler.notFound(new ResourceNotFoundException("missing")).getStatusCode());
    }

    @Test
    void conflictMapsToConflict() {
        assertEquals(HttpStatus.CONFLICT, handler.conflict(new ConflictException("duplicate")).getStatusCode());
    }

    @Test
    void domainFailureMapsToUnprocessableEntity() {
        assertEquals(HttpStatus.UNPROCESSABLE_ENTITY, handler.domain(new DomainException("rule failed")).getStatusCode());
    }

    @Test
    void unexpectedFailureMapsToInternalServerError() {
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, handler.unexpected(new RuntimeException("secret detail")).getStatusCode());
    }

    @Test
    void unexpectedIllegalStateIsNotMisreportedAsAClientConflict() {
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR,
                handler.unexpected(new IllegalStateException("implementation bug")).getStatusCode());
    }
}
