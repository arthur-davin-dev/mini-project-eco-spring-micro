package kh.eco.istad.platform.order.domain.entity;

import kh.eco.istad.common.domain.entity.AggregateRoot;
import kh.eco.istad.common.domain.valueobject.BusinessId;
import kh.eco.istad.platform.order.domain.exception.OrderDomainException;

import java.util.List;

public class Business extends AggregateRoot<BusinessId> {

    private final List<Product> products;
    private final boolean active;

    public Business(BusinessId id, List<Product> products, boolean active) {
        if (id == null || products == null || products.stream().anyMatch(java.util.Objects::isNull)) {
            throw new OrderDomainException("Business snapshot requires an id and valid products");
        }
        super.setId(id);
        this.products = List.copyOf(products);
        this.active = active;
    }

    public List<Product> getProducts() {
        return products;
    }

    public boolean isActive() {
        return active;
    }
}
