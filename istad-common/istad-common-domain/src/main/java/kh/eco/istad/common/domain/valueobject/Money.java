package kh.eco.istad.common.domain.valueobject;

import kh.eco.istad.common.domain.exception.DomainException;

import java.math.BigDecimal;
import java.math.RoundingMode;

public record Money(BigDecimal amount) {
    public static final Money ZERO = new Money(BigDecimal.ZERO);
    public Money{
        if (amount == null){
            throw new DomainException("Money amount must not be null");
        }
        amount = amount.setScale(2, RoundingMode.HALF_EVEN);
    }

    public boolean isGreaterThanZero(){
        return amount.compareTo(BigDecimal.ZERO) > 0;
    }

    public boolean isGreaterThan(Money other) {
        return amount.compareTo(other.amount) > 0;
    }

    public Money add(Money other) {
        return new Money(amount.add(other.amount));
    }

    public Money subtract(Money other) {
        return new Money(amount.subtract(other.amount));
    }

    public Money multiply(int factor) {
        return new Money(amount.multiply(BigDecimal.valueOf(factor)));
    }

}
