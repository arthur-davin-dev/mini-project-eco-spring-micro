package kh.eco.istad.platform.business.domain.entity;

import kh.eco.istad.common.domain.entity.BaseEntity;
import kh.eco.istad.common.domain.valueobject.Money;
import kh.eco.istad.platform.business.domain.valueobject.ProductId;

public class Product extends BaseEntity<ProductId> {

    private final String name;
    private final Money price;
    private final int quantity;
    private final boolean available;

    public Product(ProductId id, String name, Money price, int quantity, boolean available) {
        super.setId(id);
        this.name = name;
        this.price = price;
        this.quantity = quantity;
        this.available = available;
    }

    public String getName() {
        return name;
    }

    public Money getPrice() {
        return price;
    }

    public int getQuantity() {
        return quantity;
    }

    public boolean isAvailable() {
        return available;
    }
}