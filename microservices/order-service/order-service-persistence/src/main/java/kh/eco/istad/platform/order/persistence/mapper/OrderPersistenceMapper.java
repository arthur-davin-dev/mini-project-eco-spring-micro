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
import kh.eco.istad.platform.order.persistence.entity.OrderItemEntityId;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Component
public class OrderPersistenceMapper {

    public OrderEntity toOrderEntity(Order order) {
        return OrderEntity.builder()
                .id(order.getId().value())
                .businessId(order.getBusinessId().value())
                .customerId(order.getCustomerId().value())
                .failureMessages(joinMessages(order.getFailureMessages()))
                .orderStatus(order.getOrderStatus())
                .price(order.getPrice().amount())
                .trackingId(order.getTrackingId().value())
                .orderAddressId(order.getDeliveryAddress().id())
                .build();
    }

    public OrderAddressEntity toAddressEntity(Order order) {
        StreetAddress address = order.getDeliveryAddress();
        return OrderAddressEntity.builder()
                .id(address.id())
                .street(address.street())
                .postalCode(address.postalCode())
                .city(address.city())
                .build();
    }

    public List<OrderItemEntity> toItemEntities(Order order) {
        return order.getItems().stream()
                .map(item -> toItemEntity(item, order.getId().value()))
                .toList();
    }

    public Order toDomain(
            OrderEntity entity,
            OrderAddressEntity address,
            List<OrderItemEntity> itemEntities
    ) {
        OrderId orderId = new OrderId(entity.getId());
        List<OrderItem> items = itemEntities.stream()
                .map(this::toDomainItem)
                .toList();

        return Order.builder()
                .id(orderId)
                .customerId(new CustomerId(entity.getCustomerId()))
                .businessId(new BusinessId(entity.getBusinessId()))
                .deliveryAddress(toDomainAddress(address))
                .price(new Money(entity.getPrice()))
                .items(new ArrayList<>(items))
                .trackingId(new TrackingId(entity.getTrackingId()))
                .orderStatus(entity.getOrderStatus())
                .failureMessages(splitMessages(entity.getFailureMessages()))
                .build();
    }

    private OrderItemEntity toItemEntity(OrderItem item, UUID orderId) {
        return OrderItemEntity.builder()
                .orderItemEntityId(new OrderItemEntityId(item.getId().value(), orderId))
                .productId(item.getProduct().getId().value())
                .price(item.getPrice().amount())
                .quantity(item.getQuantity())
                .subTotal(item.getSubTotal().amount())
                .build();
    }

    private OrderItem toDomainItem(OrderItemEntity item) {
        return OrderItem.builder()
                .id(new OrderItemId(item.getOrderItemEntityId().id()))
                .orderId(new OrderId(item.getOrderItemEntityId().orderId()))
                .product(new Product(
                        new ProductId(item.getProductId()),
                        null,
                        new Money(item.getPrice())))
                .quantity(item.getQuantity())
                .price(new Money(item.getPrice()))
                .subTotal(new Money(item.getSubTotal()))
                .build();
    }

    private StreetAddress toDomainAddress(OrderAddressEntity address) {
        return new StreetAddress(
                address.getId(),
                address.getStreet(),
                address.getPostalCode(),
                address.getCity());
    }

    private String joinMessages(List<String> messages) {
        return messages == null ? "" : String.join(",", messages);
    }

    private List<String> splitMessages(String messages) {
        if (messages == null || messages.isBlank()) {
            return new ArrayList<>();
        }
        return new ArrayList<>(Arrays.asList(messages.split(",")));
    }
}
