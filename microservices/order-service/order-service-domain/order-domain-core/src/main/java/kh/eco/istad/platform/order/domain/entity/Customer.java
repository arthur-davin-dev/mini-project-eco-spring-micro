package kh.eco.istad.platform.order.domain.entity;

import kh.eco.istad.common.domain.entity.AggregateRoot;
import kh.eco.istad.common.domain.valueobject.CustomerId;

public class Customer extends AggregateRoot<CustomerId> {

    public Customer(CustomerId id) {
        super.setId(id);
    }
}