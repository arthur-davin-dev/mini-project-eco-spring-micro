
package kh.eco.istad.platform.order.persistence.mapper;

import kh.eco.istad.common.domain.valueobject.BusinessId;
import kh.eco.istad.common.domain.valueobject.CustomerId;
import kh.eco.istad.common.domain.valueobject.Money;
import kh.eco.istad.common.domain.valueobject.OrderId;
import kh.eco.istad.platform.order.domain.entity.Order;
import kh.eco.istad.platform.order.domain.entity.OrderItem;
import kh.eco.istad.platform.order.domain.entity.Product;
import kh.eco.istad.platform.order.domain.valueobject.OrderItemId;
import kh.eco.istad.platform.order.domain.valueobject.ProductId;
import kh.eco.istad.platform.order.domain.valueobject.StreetAddress;
import kh.eco.istad.platform.order.domain.valueobject.TrackingId;
import kh.eco.istad.platform.order.persistence.entity.OrderAddressEntity;
import kh.eco.istad.platform.order.persistence.entity.OrderEntity;
import kh.eco.istad.platform.order.persistence.entity.OrderItemEntity;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class OrderPersistenceMapper {

    // ---------- Domain -> JPA ----------

    public OrderEntity toEntity(Order order) {
        OrderEntity entity = OrderEntity.builder()
                .id(order.getId().value())
                .customerId(order.getCustomerId().value())
                .businessId(order.getBusinessId().value())
                .trackingId(order.getTrackingId().value())
                .price(order.getPrice().amount())
                .orderStatus(order.getOrderStatus())
                .failureMessages(String.join(",", order.getFailureMessages() == null
                        ? List.of()
                        : order.getFailureMessages()))
                .build();

        StreetAddress address = order.getDeliveryAddress();
        entity.setAddress(OrderAddressEntity.builder()
                .id(address.id())
                .order(entity)
                .street(address.street())
                .postalCode(address.postalCode())
                .city(address.city())
                .build());

        entity.setItems(order.getItems().stream()
                .map(item -> OrderItemEntity.builder()
                        .id(item.getId().value())
                        .order(entity)
                        .productId(item.getProduct().getId().value())
                        .price(item.getPrice().amount())
                        .quantity(item.getQuantity())
                        .subTotal(item.getSubTotal().amount())
                        .build())
                .collect(Collectors.toCollection(ArrayList::new)));

        return entity;
    }

    // ---------- JPA -> Domain ----------

    public Order toDomain(OrderEntity entity) {
        OrderId orderId = new OrderId(entity.getId());
        OrderAddressEntity address = entity.getAddress();

        List<OrderItem> items = entity.getItems().stream()
                .map(item -> OrderItem.builder()
                        .id(new OrderItemId(item.getId()))
                        .orderId(orderId)
                        .product(new Product(new ProductId(item.getProductId()), null, new Money(item.getPrice())))
                        .quantity(item.getQuantity())
                        .price(new Money(item.getPrice()))
                        .subTotal(new Money(item.getSubTotal()))
                        .build())
                .collect(Collectors.toCollection(ArrayList::new));

        return Order.builder()
                .id(orderId)
                .customerId(new CustomerId(entity.getCustomerId()))
                .businessId(new BusinessId(entity.getBusinessId()))
                .deliveryAddress(new StreetAddress(
                        address.getId(), address.getStreet(), address.getPostalCode(), address.getCity()))
                .price(new Money(entity.getPrice()))
                .items(items)
                .trackingId(new TrackingId(entity.getTrackingId()))
                .orderStatus(entity.getOrderStatus())
                .failureMessages(splitMessages(entity.getFailureMessages()))
                .build();
    }

    private List<String> splitMessages(String value) {
        if (value == null || value.isBlank()) {
            return new ArrayList<>();
        }
        return new ArrayList<>(Arrays.asList(value.split(",")));
    }
}
