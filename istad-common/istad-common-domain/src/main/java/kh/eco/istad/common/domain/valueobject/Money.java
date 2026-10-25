package kh.eco.istad.common.domain.valueobject;

//import kh.eco.istad.common.domain.exception.DomainException;
//
//import java.math.BigDecimal;
//import java.math.RoundingMode;
//
//public record Money(BigDecimal amount) {
//    public static final Money ZERO = new Money(BigDecimal.ZERO);
//    public Money{
//        if (amount == null){
//            throw new DomainException("Money amount must not be null");
//        }
//        amount = amount.setScale(2, RoundingMode.HALF_EVEN);
//    }
//
//    public boolean isGreaterThanZero(){
//        return amount.compareTo(BigDecimal.ZERO) > 0;
//    }
//
//    public boolean isGreaterThan(Money other) {
//        return amount.compareTo(other.amount) > 0;
//    }
//
//    public Money add(Money other) {
//        return new Money(amount.add(other.amount));
//    }
//
//    public Money subtract(Money other) {
//        return new Money(amount.subtract(other.amount));
//    }
//
//    public Money multiply(int factor) {
//        return new Money(amount.multiply(BigDecimal.valueOf(factor)));
//    }
//
//}


import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Objects;

public record Money(
        BigDecimal amount
) {

    public static final Money ZERO = new Money(BigDecimal.ZERO);

    public boolean isGreaterThanZero() {
        return this.amount != null && this.amount.compareTo(BigDecimal.ZERO) > 0;
    }

    public boolean isLessThanZero() {
        return this.amount != null && this.amount.compareTo(BigDecimal.ZERO) < 0;
    }

    public boolean isGreaterThan(Money other) {
        return this.amount != null && this.amount.compareTo(other.amount) > 0;
    }

    public Money add(Money money) {
        BigDecimal newAmount = this.amount.add(money.amount);
        return new Money(setScale(newAmount));
    }

    public Money subtract(Money money) {
        BigDecimal newAmount = this.amount.subtract(money.amount);
        return new Money(setScale(newAmount));
    }

    public Money multiply(int multiplier) {
        BigDecimal newAmount = this.amount.multiply(BigDecimal.valueOf(multiplier));
        return new Money(setScale(newAmount));
    }

    private BigDecimal setScale(BigDecimal inputAmount) {
        return inputAmount.setScale(2, RoundingMode.HALF_EVEN);
    }

    @Override
    public boolean equals(Object other) {
        if (this == other) return true;
        if (!(other instanceof Money money)) return false;
        return amount == null ? money.amount == null
                : money.amount != null && amount.compareTo(money.amount) == 0;
    }

    @Override
    public int hashCode() {
        return amount == null ? 0 : Objects.hash(amount.stripTrailingZeros());
    }
}
