package kh.eco.istad.platform.payment.domain.entity;

import kh.eco.istad.common.domain.entity.AggregateRoot;
import kh.eco.istad.common.domain.valueobject.CustomerId;
import kh.eco.istad.common.domain.valueobject.Money;
import kh.eco.istad.platform.payment.domain.exception.PaymentDomainException;
import kh.eco.istad.platform.payment.domain.valueobject.CreditHistoryId;
import kh.eco.istad.platform.payment.domain.valueobject.TransactionType;

public class CreditHistory extends AggregateRoot<CreditHistoryId> {

    private final CustomerId customerId;
    private final Money amount;
    private final TransactionType transactionType;

    public CreditHistory(CreditHistoryId id, CustomerId customerId, Money amount,
                         TransactionType transactionType) {
        if (id == null || customerId == null || amount == null || !amount.isGreaterThanZero() || transactionType == null)
            throw new PaymentDomainException("Credit history requires an id, customer, positive amount, and transaction type");
        super.setId(id);
        this.customerId = customerId;
        this.amount = amount;
        this.transactionType = transactionType;
    }

    public CustomerId getCustomerId() {
        return customerId;
    }

    public Money getAmount() {
        return amount;
    }

    public TransactionType getTransactionType() {
        return transactionType;
    }
}
