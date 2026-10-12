package kh.eco.istad.platform.order.domain.mapper;

import kh.eco.istad.common.domain.valueobject.BusinessId;
import kh.eco.istad.common.domain.valueobject.CustomerId;
import kh.eco.istad.common.domain.valueobject.Money;
import kh.eco.istad.platform.order.domain.dto.AddressCommand;
import kh.eco.istad.platform.order.domain.dto.CreateOrderCommand;
import kh.eco.istad.platform.order.domain.dto.CreateOrderResult;
import kh.eco.istad.platform.order.domain.entity.Order;
import kh.eco.istad.platform.order.domain.entity.OrderItem;
import kh.eco.istad.platform.order.domain.entity.Product;
import kh.eco.istad.platform.order.domain.valueobject.ProductId;
import kh.eco.istad.platform.order.domain.valueobject.StreetAddress;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

@Component
public class OrderDataMapper {

    public Order toOrder(CreateOrderCommand command) {
        AddressCommand address = command.address();

        List<OrderItem> items = command.items().stream()
                .map(item -> OrderItem.builder()
                        .product(new Product(new ProductId(item.productId())))
                        .quantity(item.quantity())
                        .price(new Money(item.price()))
                        .subTotal(new Money(item.subTotal()))
                        .build())
                .toList();

        return Order.builder()
                .customerId(new CustomerId(command.customerId()))
                .businessId(new BusinessId(command.businessId()))
                .deliveryAddress(new StreetAddress(
                        UUID.randomUUID(), address.street(), address.postalCode(), address.city()))
                .price(new Money(command.price()))
                .items(items)
                .build();
    }

    public CreateOrderResult toResult(Order order, String message) {
        return new CreateOrderResult(
                order.getId().value(),
                order.getTrackingId().value(),
                order.getOrderStatus(),
                message);
    }
}