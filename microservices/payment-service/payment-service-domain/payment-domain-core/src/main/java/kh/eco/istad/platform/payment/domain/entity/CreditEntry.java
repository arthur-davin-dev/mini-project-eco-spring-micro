package kh.eco.istad.platform.payment.domain.entity;

import kh.eco.istad.common.domain.entity.AggregateRoot;
import kh.eco.istad.common.domain.valueobject.CustomerId;
import kh.eco.istad.common.domain.valueobject.Money;
import kh.eco.istad.platform.payment.domain.exception.PaymentDomainException;
import kh.eco.istad.platform.payment.domain.valueobject.CreditEntryId;

public class CreditEntry extends AggregateRoot<CreditEntryId> {

    private final CustomerId customerId;
    private Money totalCreditAmount;

    public CreditEntry(CreditEntryId id, CustomerId customerId, Money totalCreditAmount) {
        if (id == null || customerId == null || totalCreditAmount == null || totalCreditAmount.amount().signum() < 0)
            throw new PaymentDomainException("Credit entry requires an id, customer, and non-negative balance");
        super.setId(id);
        this.customerId = customerId;
        this.totalCreditAmount = totalCreditAmount;
    }

    public void addCreditAmount(Money amount) {
        requirePositive(amount);
        totalCreditAmount = totalCreditAmount.add(amount);
    }

    public void subtractCreditAmount(Money amount) {
        requirePositive(amount);
        if (amount.isGreaterThan(totalCreditAmount)) {
            throw new PaymentDomainException("Credit balance cannot become negative");
        }
        totalCreditAmount = totalCreditAmount.subtract(amount);
    }

    private void requirePositive(Money amount) {
        if (amount == null || !amount.isGreaterThanZero()) {
            throw new PaymentDomainException("Credit change must be greater than zero");
        }
    }

    public CustomerId getCustomerId() {
        return customerId;
    }

    public Money getTotalCreditAmount() {
        return totalCreditAmount;
    }
}
