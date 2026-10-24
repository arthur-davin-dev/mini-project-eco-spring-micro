package kh.eco.istad.platform.order.domain.entity;

import kh.eco.istad.common.domain.entity.AggregateRoot;
import kh.eco.istad.common.domain.valueobject.BusinessId;
import kh.eco.istad.common.domain.valueobject.CustomerId;
import kh.eco.istad.common.domain.valueobject.Money;
import kh.eco.istad.common.domain.valueobject.OrderId;
import kh.eco.istad.common.domain.valueobject.OrderStatus;
import kh.eco.istad.common.domain.exception.ConflictException;
import kh.eco.istad.platform.order.domain.exception.OrderDomainException;
import kh.eco.istad.platform.order.domain.valueobject.OrderItemId;
import kh.eco.istad.platform.order.domain.valueobject.StreetAddress;
import kh.eco.istad.platform.order.domain.valueobject.TrackingId;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;


public class Order extends AggregateRoot<OrderId> {
    private final CustomerId customerId;
    private final BusinessId businessId;
    private final StreetAddress deliveryAddress;
    private Money price; // orderPrice
    private final List<OrderItem> items;

    private TrackingId trackingId;
    private OrderStatus orderStatus;
    private List<String> failureMessages;
    private final Long version;

    private Order(Builder builder) {
        super.setId(builder.id);
        customerId = builder.customerId;
        businessId = builder.businessId;
        deliveryAddress = builder.deliveryAddress;
        price = builder.price;
        items = builder.items;
        trackingId = builder.trackingId;
        orderStatus = builder.orderStatus;
        failureMessages = builder.failureMessages;
        version = builder.version;
    }

    public static Builder builder() {
        return new Builder();
    }

    // ------- start domain logic -------- //

    /**
     * Initialize order
     */
    public void initializeOrder() {

        if (super.getId() != null || orderStatus != null) {
            throw new OrderDomainException("Order has already been initialized");
        }

        super.setId(new OrderId(UUID.randomUUID()));
        trackingId = new TrackingId(UUID.randomUUID());
        orderStatus = OrderStatus.PENDING;
        validateOrder();
    }

    /**
     * Pay order
     */
    public void pay() {
        if (orderStatus != OrderStatus.PENDING) {
            throw new OrderDomainException("Order state is not correct for pay operation");
        }
        orderStatus = OrderStatus.PAID;
    }


    /**
     * Approve order
     */
    public void approve() {
        if (orderStatus != OrderStatus.PAID) {
            throw new OrderDomainException("Order state is not correct for approve operation");
        }
        orderStatus = OrderStatus.APPROVED;
    }


    /**
     * Init cancel order
     */
    public void initCancel(List<String> failureMessages) {
        if (orderStatus != OrderStatus.PAID) {
            throw new OrderDomainException("Order state is not correct for init cancel operation");
        }
        orderStatus = OrderStatus.CANCELLING;
        updateFailureMessages(failureMessages);
    }

    /**
     * cancel order
     */
    public void cancel(List<String> failureMessages) {
        if (!(orderStatus == OrderStatus.PENDING || orderStatus == OrderStatus.CANCELLING)) {
            throw new OrderDomainException("Order state is not correct for cancel operation");
        }
        orderStatus = OrderStatus.CANCELLED;
        updateFailureMessages(failureMessages);
    }


    /**
     * Update failure messages based on condition
     * @param failureMessages are reasons of failure
     */
    private void updateFailureMessages(List<String> failureMessages) {
        if (this.failureMessages != null && failureMessages != null) {
            this.failureMessages.addAll(failureMessages.stream().filter(
                    message -> !message.isBlank()
            ).toList());
        } else {
            this.failureMessages = failureMessages;
        }
    }

    public void calculatePriceFromItems() {
        if (items.isEmpty()) {
            throw new OrderDomainException("Order must contain at least one item!");
        }
        Money total = Money.ZERO;
        for (OrderItem item : items) {
            if (item == null || item.getSubTotal() == null) {
                throw new OrderDomainException("Order items must have a calculated subtotal");
            }
            total = total.add(item.getSubTotal());
        }
        price = total;
    }

    // ------- end domain logic -------- //

    /**
     * Validate order data
     */
    public void validateOrder() {
        // Validate order price
        if (price == null || !price.isGreaterThanZero()) {
            throw new OrderDomainException("Price must be greater than zero");
        }

        // Validate product price
        Money orderSubTotal = items.stream()
                .map(orderItem -> {
                    validateItemPrice(orderItem);
                    return orderItem.getSubTotal();
                })
                .reduce(Money.ZERO, Money::add);

        if (!price.equals(orderSubTotal)) {
            throw new OrderDomainException("Price is not equal to order sub total");
        }
    }

    private void validateItemPrice(OrderItem orderItem) {
        if (!orderItem.getPrice().equals(orderItem.getProduct().getPrice())) {
            throw new OrderDomainException("Price must be equal to product price");
        }
    }

    public CustomerId getCustomerId() {
        return customerId;
    }

    public BusinessId getBusinessId() {
        return businessId;
    }

    public StreetAddress getDeliveryAddress() {
        return deliveryAddress;
    }

    public Money getPrice() {
        return price;
    }

    public List<OrderItem> getItems() {
        return items;
    }

    public TrackingId getTrackingId() {
        return trackingId;
    }

    public OrderStatus getOrderStatus() {
        return orderStatus;
    }

    public List<String> getFailureMessages() {
        return failureMessages;
    }

    public Long getVersion() {
        return version;
    }

    public static final class Builder {
        private OrderId id;
        private CustomerId customerId;
        private BusinessId businessId;
        private StreetAddress deliveryAddress;
        private Money price;
        private List<OrderItem> items;
        private TrackingId trackingId;
        private OrderStatus orderStatus;
        private List<String> failureMessages;
        private Long version;

        private Builder() {
        }

        public Builder id(OrderId val) {
            id = val;
            return this;
        }

        public Builder customerId(CustomerId val) {
            customerId = val;
            return this;
        }

        public Builder businessId(BusinessId val) {
            businessId = val;
            return this;
        }

        public Builder deliveryAddress(StreetAddress val) {
            deliveryAddress = val;
            return this;
        }

        public Builder price(Money val) {
            price = val;
            return this;
        }

        public Builder items(List<OrderItem> val) {
            items = val;
            return this;
        }

        public Builder trackingId(TrackingId val) {
            trackingId = val;
            return this;
        }

        public Builder orderStatus(OrderStatus val) {
            orderStatus = val;
            return this;
        }

        public Builder failureMessages(List<String> val) {
            failureMessages = val;
            return this;
        }

        public Builder version(Long val) {
            version = val;
            return this;
        }

        public Order build() {
            return new Order(this);
        }
    }
}





//
//public class Order extends AggregateRoot<OrderId> {
//
//    private final CustomerId customerId;
//    private final BusinessId businessId;
//    private final StreetAddress deliveryAddress;
//    private Money price;
//    private final List<OrderItem> items;
//
//    private TrackingId trackingId;
//    private OrderStatus orderStatus;
//    private final List<String> failureMessages;
//
//    // ---------- Domain logic ----------
//
//    public void validateOrder() {
//        validateInitialOrder();
//        validateTotalPrice();
//        validateItemsPrice();
//    }
//
//    public void initializeOrder() {
//        validateOrder();
//        super.setId(new OrderId(UUID.randomUUID()));
//        trackingId = new TrackingId(UUID.randomUUID());
//        orderStatus = OrderStatus.PENDING;
//        items.forEach(item -> item.initializeOrderItem(getId(), new OrderItemId(UUID.randomUUID())));
//    }
//
//    public void calculatePriceFromItems() {
//        if (items.isEmpty()) {
//            throw new OrderDomainException("Order must contain at least one item!");
//        }
//        Money total = Money.ZERO;
//        for (OrderItem item : items) {
//            if (item == null || item.getSubTotal() == null) {
//                throw new OrderDomainException("Order items must have a calculated subtotal");
//            }
//            total = total.add(item.getSubTotal());
//        }
//        price = total;
//    }
//
//    public void pay() {
//        if (orderStatus != OrderStatus.PENDING) {
//            throw new ConflictException("Order is not in correct state for pay operation");
//        }
//        orderStatus = OrderStatus.PAID;
//    }
//
//    public void approve() {
//        if (orderStatus != OrderStatus.PAID) {
//            throw new ConflictException("Order is not in correct state for approve operation");
//        }
//        orderStatus = OrderStatus.APPROVED;
//    }
//
//    public void initCancel(List<String> messages) {
//        if (orderStatus != OrderStatus.PAID) {
//            throw new ConflictException("Order is not in correct state for initCancel operation");
//        }
//        orderStatus = OrderStatus.CANCELLING;
//        updateFailureMessages(messages);
//    }
//
//    public void cancel(List<String> messages) {
//        if (!(orderStatus == OrderStatus.PENDING || orderStatus == OrderStatus.CANCELLING)) {
//            throw new ConflictException("Order is not in correct state for cancel operation");
//        }
//        orderStatus = OrderStatus.CANCELLED;
//        updateFailureMessages(messages);
//    }
//
//    private void updateFailureMessages(List<String> messages) {
//        if (messages == null) {
//            return;
//        }
//        failureMessages.addAll(messages.stream()
//                .filter(message -> message != null && !message.isBlank())
//                .toList());
//    }
//
//    private void validateInitialOrder() {
//        if (orderStatus != null || getId() != null) {
//            throw new ConflictException("Order is not in correct state for initialization");
//        }
//        if (customerId == null || businessId == null || deliveryAddress == null) {
//            throw new OrderDomainException("Customer, business, and delivery address are required");
//        }
//    }
//
//    private void validateTotalPrice() {
//        if (price == null || !price.isGreaterThanZero()) {
//            throw new OrderDomainException("Total price must be greater than zero!");
//        }
//    }
//
//    private void validateItemsPrice() {
//        if (items.isEmpty()) {
//            throw new OrderDomainException("Order must contain at least one item!");
//        }
//        Money itemsTotal = Money.ZERO;
//        for (OrderItem item : items) {
//            if (item == null || !item.isPriceValid()) {
//                if (item == null) throw new OrderDomainException("Order must not contain a null item");
//                throw new OrderDomainException("Order item contains invalid product, quantity, price, or subtotal data");
//            }
//            itemsTotal = itemsTotal.add(item.getSubTotal());
//        }
//        if (!price.equals(itemsTotal)) {
//            throw new OrderDomainException("Total price: " + price.amount()
//                    + " is not equal to order items total: " + itemsTotal.amount() + "!");
//        }
//    }
//
//    // ---------- Getters ----------
//
//    public CustomerId getCustomerId() {
//        return customerId;
//    }
//
//    public BusinessId getBusinessId() {
//        return businessId;
//    }
//
//    public StreetAddress getDeliveryAddress() {
//        return deliveryAddress;
//    }
//
//    public Money getPrice() {
//        return price;
//    }
//
//    public List<OrderItem> getItems() {
//        return List.copyOf(items);
//    }
//
//    public TrackingId getTrackingId() {
//        return trackingId;
//    }
//
//    public OrderStatus getOrderStatus() {
//        return orderStatus;
//    }
//
//    public List<String> getFailureMessages() {
//        return List.copyOf(failureMessages);
//    }
//
//    // ---------- Builder ----------
//
//    private Order(Builder builder) {
//        super.setId(builder.id);
//        customerId = builder.customerId;
//        businessId = builder.businessId;
//        deliveryAddress = builder.deliveryAddress;
//        price = builder.price;
//        items = builder.items == null ? new ArrayList<>() : new ArrayList<>(builder.items);
//        trackingId = builder.trackingId;
//        orderStatus = builder.orderStatus;
//        failureMessages = builder.failureMessages == null
//                ? new ArrayList<>() : new ArrayList<>(builder.failureMessages);
//    }
//
//    public static Builder builder() {
//        return new Builder();
//    }
//
//    public static final class Builder {
//        private OrderId id;
//        private CustomerId customerId;
//        private BusinessId businessId;
//        private StreetAddress deliveryAddress;
//        private Money price;
//        private List<OrderItem> items;
//        private TrackingId trackingId;
//        private OrderStatus orderStatus;
//        private List<String> failureMessages;
//
//        private Builder() {
//        }
//
//        public Builder id(OrderId val) {
//            id = val;
//            return this;
//        }
//
//        public Builder customerId(CustomerId val) {
//            customerId = val;
//            return this;
//        }
//
//        public Builder businessId(BusinessId val) {
//            businessId = val;
//            return this;
//        }
//
//        public Builder deliveryAddress(StreetAddress val) {
//            deliveryAddress = val;
//            return this;
//        }
//
//        public Builder price(Money val) {
//            price = val;
//            return this;
//        }
//
//        public Builder items(List<OrderItem> val) {
//            items = val == null ? null : new ArrayList<>(val);
//            return this;
//        }
//
//        public Builder trackingId(TrackingId val) {
//            trackingId = val;
//            return this;
//        }
//
//        public Builder orderStatus(OrderStatus val) {
//            orderStatus = val;
//            return this;
//        }
//
//        public Builder failureMessages(List<String> val) {
//            failureMessages = val;
//            return this;
//        }
//
//        public Order build() {
//            return new Order(this);
//        }
//    }
//}
