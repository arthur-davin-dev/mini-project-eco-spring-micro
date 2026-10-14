package kh.eco.istad.platform.payment.restapi.dto;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class InitiatePaymentRequestValidationTest {

    private static Validator validator;
    private static ValidatorFactory validatorFactory;

    @BeforeAll
    static void createValidator() {
        validatorFactory = Validation.buildDefaultValidatorFactory();
        validator = validatorFactory.getValidator();
    }

    @AfterAll
    static void closeValidator() {
        validatorFactory.close();
    }

    @Test
    void rejectsMissingReferencesNonPositiveAmountsAndExcessPrecision() {
        var missingFields = validator.validate(new InitiatePaymentRequest(null, null, null));
        var zeroAmount = validator.validate(new InitiatePaymentRequest(UUID.randomUUID(), UUID.randomUUID(), new BigDecimal("0.00")));
        var excessivePrecision = validator.validate(new InitiatePaymentRequest(UUID.randomUUID(), UUID.randomUUID(), new BigDecimal("1.001")));

        assertEquals(3, missingFields.size());
        assertTrue(zeroAmount.stream().anyMatch(error -> error.getPropertyPath().toString().equals("amount")));
        assertTrue(excessivePrecision.stream().anyMatch(error -> error.getPropertyPath().toString().equals("amount")));
    }

    @Test
    void acceptsValidPaymentRequest() {
        var request = new InitiatePaymentRequest(UUID.randomUUID(), UUID.randomUUID(), new BigDecimal("12.50"));

        assertTrue(validator.validate(request).isEmpty());
    }
}
