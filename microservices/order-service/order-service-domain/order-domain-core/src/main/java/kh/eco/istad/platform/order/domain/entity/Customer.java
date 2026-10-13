//package kh.eco.istad.platform.order.domain.entity;
//
//import kh.eco.istad.common.domain.entity.AggregateRoot;
//import kh.eco.istad.common.domain.valueobject.CustomerId;
//
//public class Customer extends AggregateRoot<CustomerId> {
//
//    public Customer(CustomerId id) {
//        super.setId(id);
//    }
//}


package kh.eco.istad.platform.order.domain.entity;

import kh.eco.istad.common.domain.entity.AggregateRoot;
import kh.eco.istad.common.domain.valueobject.CustomerId;
import kh.eco.istad.platform.order.domain.exception.OrderDomainException;

public class Customer extends AggregateRoot<CustomerId> {

    private final boolean active;

    public Customer(CustomerId id, boolean active) {
        super.setId(id);
        this.active = active;
    }

    public void validateActive() {
        if (!active) {
            throw new OrderDomainException("Customer " + getId().value() + " is not active!");
        }
    }

    public boolean isActive() {
        return active;
    }
}