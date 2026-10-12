package kh.eco.istad.common.domain.valueobject;

import kh.eco.istad.common.domain.exception.DomainException;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class MoneyTest {

    private Money money(String value) {
        return new Money(new BigDecimal(value));
    }

    @Test
    void amountIsRoundedToTwoDecimals() {
        assertEquals(new BigDecimal("2.35"), money("2.345").amount());
    }

    @Test
    void sameValueWithDifferentScaleIsEqual() {
        assertEquals(money("5"), money("5.00"));
    }

    @Test
    void nullAmountIsRejected() {
        assertThrows(DomainException.class, () -> new Money(null));
    }

    @Test
    void greaterThanZeroChecks() {
        assertFalse(Money.ZERO.isGreaterThanZero());
        assertTrue(money("0.01").isGreaterThanZero());
        assertTrue(money("5.00").isGreaterThan(money("4.99")));
    }

    @Test
    void arithmeticWorks() {
        assertEquals(money("7.50"), money("5.00").add(money("2.50")));
        assertEquals(money("2.50"), money("5.00").subtract(money("2.50")));
        assertEquals(money("10.00"), money("5.00").multiply(2));
    }
}