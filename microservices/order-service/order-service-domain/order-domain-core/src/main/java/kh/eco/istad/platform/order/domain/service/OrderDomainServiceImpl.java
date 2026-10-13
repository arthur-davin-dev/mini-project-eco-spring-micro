package kh.eco.istad.platform.order.domain.service;

import kh.eco.istad.platform.order.domain.entity.Business;
import kh.eco.istad.platform.order.domain.entity.Order;
import kh.eco.istad.platform.order.domain.entity.OrderItem;
import kh.eco.istad.platform.order.domain.entity.Product;
import kh.eco.istad.platform.order.domain.event.OrderCancelledEvent;
import kh.eco.istad.platform.order.domain.event.OrderCreatedEvent;
import kh.eco.istad.platform.order.domain.event.OrderPaidEvent;
import kh.eco.istad.platform.order.domain.exception.OrderDomainException;

import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;

public class OrderDomainServiceImpl implements OrderDomainService {

    private static final ZoneId UTC = ZoneId.of("UTC");

    @Override
    public OrderCreatedEvent validateAndInitiateOrder(Order order, Business business) {
        validateBusiness(order, business);
        setOrderProductInformation(order, business);
        order.calculatePriceFromItems();
        order.validateOrder();
        order.initializeOrder();
        return new OrderCreatedEvent(order, ZonedDateTime.now(UTC));
    }

    @Override
    public OrderPaidEvent payOrder(Order order) {
        order.pay();
        return new OrderPaidEvent(order, ZonedDateTime.now(UTC));
    }

    @Override
    public void approveOrder(Order order) {
        order.approve();
    }

    @Override
    public OrderCancelledEvent cancelOrderPayment(Order order, List<String> failureMessages) {
        order.initCancel(failureMessages);
        return new OrderCancelledEvent(order, ZonedDateTime.now(UTC));
    }

    @Override
    public void cancelOrder(Order order, List<String> failureMessages) {
        order.cancel(failureMessages);
    }

    private void validateBusiness(Order order, Business business) {
        if (business == null || !business.isActive()) {
            throw new OrderDomainException("Business is currently not active!");
        }
        if (!business.getId().equals(order.getBusinessId())) {
            throw new OrderDomainException("Order does not belong to this business!");
        }
    }

    // Replace what the client sent with the catalog's real name and price,
    // so a tampered price is caught later by order.validateOrder().
    private void setOrderProductInformation(Order order, Business business) {
        for (OrderItem item : order.getItems()) {
            Product catalogProduct = business.getProducts().stream()
                    .filter(product -> product.getId().equals(item.getProduct().getId()))
                    .findFirst()
                    .orElseThrow(() -> new OrderDomainException(
                            "Product " + item.getProduct().getId().value() + " is not sold by this business!"));
            item.getProduct().updateWithConfirmedNameAndPrice(
                    catalogProduct.getName(), catalogProduct.getPrice());
            if (!item.isPriceValid()) {
                throw new OrderDomainException("Submitted price does not match catalog price for product "
                        + item.getProduct().getId().value());
            }
            item.updatePriceFromCatalog(catalogProduct.getPrice());
        }
    }
}
