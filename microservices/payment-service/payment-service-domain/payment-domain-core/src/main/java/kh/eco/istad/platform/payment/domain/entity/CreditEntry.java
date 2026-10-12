package kh.eco.istad.platform.payment.domain.entity;

import kh.eco.istad.common.domain.entity.AggregateRoot;
import kh.eco.istad.common.domain.valueobject.CustomerId;
import kh.eco.istad.common.domain.valueobject.Money;
import kh.eco.istad.platform.payment.domain.valueobject.CreditEntryId;

public class CreditEntry extends AggregateRoot<CreditEntryId> {

    private final CustomerId customerId;
    private Money totalCreditAmount;

    public CreditEntry(CreditEntryId id, CustomerId customerId, Money totalCreditAmount) {
        super.setId(id);
        this.customerId = customerId;
        this.totalCreditAmount = totalCreditAmount;
    }

    public void addCreditAmount(Money amount) {
        totalCreditAmount = totalCreditAmount.add(amount);
    }

    public void subtractCreditAmount(Money amount) {
        totalCreditAmount = totalCreditAmount.subtract(amount);
    }

    public CustomerId getCustomerId() {
        return customerId;
    }

    public Money getTotalCreditAmount() {
        return totalCreditAmount;
    }
}