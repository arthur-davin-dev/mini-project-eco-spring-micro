package kh.eco.istad.platform.order.domain.entity;

import kh.eco.istad.common.domain.entity.AggregateRoot;
import kh.eco.istad.common.domain.valueobject.BusinessId;

import java.util.List;

public class Business extends AggregateRoot<BusinessId> {

    private final List<Product> products;
    private final boolean active;

    public Business(BusinessId id, List<Product> products, boolean active) {
        super.setId(id);
        this.products = products;
        this.active = active;
    }

    public List<Product> getProducts() {
        return products;
    }

    public boolean isActive() {
        return active;
    }
}