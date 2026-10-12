package kh.eco.istad.platform.business.domain.entity;

import kh.eco.istad.common.domain.entity.BaseEntity;
import kh.eco.istad.common.domain.valueobject.Money;
import kh.eco.istad.common.domain.valueobject.OrderId;
import kh.eco.istad.common.domain.valueobject.OrderStatus;

import java.util.List;

public class OrderDetail extends BaseEntity<OrderId> {

    private final OrderStatus orderStatus;
    private final Money totalAmount;
    private final List<Product> products;

    public OrderDetail(OrderId id, OrderStatus orderStatus, Money totalAmount, List<Product> products) {
        super.setId(id);
        this.orderStatus = orderStatus;
        this.totalAmount = totalAmount;
        this.products = products;
    }

    public OrderStatus getOrderStatus() {
        return orderStatus;
    }

    public Money getTotalAmount() {
        return totalAmount;
    }

    public List<Product> getProducts() {
        return products;
    }
}