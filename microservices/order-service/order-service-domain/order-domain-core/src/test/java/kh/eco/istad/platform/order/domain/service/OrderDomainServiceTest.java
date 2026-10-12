package kh.eco.istad.platform.order.domain.service;

import kh.eco.istad.common.domain.valueobject.BusinessId;
import kh.eco.istad.common.domain.valueobject.CustomerId;
import kh.eco.istad.common.domain.valueobject.Money;
import kh.eco.istad.common.domain.valueobject.OrderStatus;
import kh.eco.istad.platform.order.domain.entity.Business;
import kh.eco.istad.platform.order.domain.entity.Order;
import kh.eco.istad.platform.order.domain.entity.OrderItem;
import kh.eco.istad.platform.order.domain.entity.Product;
import kh.eco.istad.platform.order.domain.event.OrderCreatedEvent;
import kh.eco.istad.platform.order.domain.exception.OrderDomainException;
import kh.eco.istad.platform.order.domain.valueobject.ProductId;
import kh.eco.istad.platform.order.domain.valueobject.StreetAddress;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

class OrderDomainServiceTest {

    private final OrderDomainService service = new OrderDomainServiceImpl();
    private final ProductId productId = new ProductId(UUID.randomUUID());
    private final BusinessId restaurantId = new BusinessId(UUID.randomUUID());

    private Money money(String value) {
        return new Money(new BigDecimal(value));
    }

    private Business business(boolean active) {
        Product catalogProduct = new Product(productId, "Burger", money("5.00"));
        return new Business(restaurantId, List.of(catalogProduct), active);
    }

    private Order order(String itemPrice) {
        OrderItem item = OrderItem.builder()
                .product(new Product(productId))
                .quantity(2)
                .price(money(itemPrice))
                .subTotal(money(itemPrice).multiply(2))
                .build();
        return Order.builder()
                .customerId(new CustomerId(UUID.randomUUID()))
                .businessId(restaurantId)
                .deliveryAddress(new StreetAddress(UUID.randomUUID(), "St 271", "12000", "Phnom Penh"))
                .price(money(itemPrice).multiply(2))
                .items(List.of(item))
                .build();
    }

    @Test
    void validOrderIsInitiatedAsPending() {
        Order order = order("5.00");

        OrderCreatedEvent event = service.validateAndInitiateOrder(order, business(true));

        assertNotNull(event.createdAt());
        assertNotNull(order.getId());
        assertNotNull(order.getTrackingId());
        assertEquals(OrderStatus.PENDING, order.getOrderStatus());
    }

    @Test
    void tamperedPriceIsRejected() {
        Order order = order("1.00");

        assertThrows(OrderDomainException.class,
                () -> service.validateAndInitiateOrder(order, business(true)));
    }

    @Test
    void inactiveBusinessIsRejected() {
        Order order = order("5.00");

        assertThrows(OrderDomainException.class,
                () -> service.validateAndInitiateOrder(order, business(false)));
    }

    @Test
    void orderLifecycleFollowsAllowedTransitions() {
        Order order = order("5.00");
        service.validateAndInitiateOrder(order, business(true));

        service.payOrder(order);
        service.approveOrder(order);

        assertEquals(OrderStatus.APPROVED, order.getOrderStatus());
        assertThrows(OrderDomainException.class,
                () -> service.cancelOrder(order, List.of("too late")));
    }
}