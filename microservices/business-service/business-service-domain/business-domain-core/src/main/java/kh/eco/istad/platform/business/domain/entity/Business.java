package kh.eco.istad.platform.business.domain.entity;

import kh.eco.istad.common.domain.entity.AggregateRoot;
import kh.eco.istad.common.domain.valueobject.BusinessId;
import kh.eco.istad.common.domain.valueobject.Money;
import kh.eco.istad.common.domain.valueobject.OrderStatus;
import kh.eco.istad.common.domain.exception.ConflictException;
import kh.eco.istad.platform.business.domain.exception.BusinessDomainException;
import kh.eco.istad.platform.business.domain.valueobject.BusinessContact;
import kh.eco.istad.platform.business.domain.valueobject.BusinessName;
import kh.eco.istad.platform.business.domain.valueobject.OrderApprovalId;
import kh.eco.istad.platform.business.domain.valueobject.OrderApprovalStatus;
import kh.eco.istad.platform.business.domain.valueobject.ProductId;

import java.util.List;
import java.util.UUID;

public class Business extends AggregateRoot<BusinessId> {

    private final BusinessName businessName;
    private final BusinessContact businessContact;
    private final OrderDetail orderDetail;
    private final List<Product> products;

    private OrderApproval orderApproval;
    private boolean active;

    // ---------- Domain logic ----------

    public void validateBusiness() {
        if (getId() != null) {
            throw new ConflictException("Business is already initialized");
        }
        if (businessName == null) {
            throw new BusinessDomainException("Business name is required!");
        }
        if (businessContact == null) {
            throw new BusinessDomainException("Business contact is required!");
        }
    }

    public void initializeBusiness() {
        super.setId(new BusinessId(UUID.randomUUID()));
        active = true;
        for (Product product : products)
            product.setId(new ProductId(UUID.randomUUID()));
    }

    public void deactivate() {
        if (!active) throw new ConflictException("Business is already inactive");
        active = false;
    }

    public void validateOrder(List<String> failureMessages) {
        if (failureMessages == null) throw new BusinessDomainException("Failure messages are required");
        if (getId() == null) throw new BusinessDomainException("Business must be initialized before validating an order");
        if (!active) {
            failureMessages.add("Business " + getId().value() + " is not active");
        }
        if (orderDetail == null) {
            failureMessages.add("There is no order to validate");
            return;
        }
        if (orderDetail.getOrderStatus() != OrderStatus.PAID) {
            failureMessages.add("Payment is not completed for order: " + orderDetail.getId().value());
        }

        Money total = Money.ZERO;
        for (Product product : orderDetail.getProducts()) {
            if (!product.isAvailable()) {
                failureMessages.add("Product with id: " + product.getId().value() + " is not available");
            }
            total = total.add(product.getPrice().multiply(product.getQuantity()));
        }
        if (!total.equals(orderDetail.getTotalAmount())) {
            failureMessages.add("Price total is not correct for order: " + orderDetail.getId().value());
        }
    }

    public void constructOrderApproval(OrderApprovalStatus status) {
        if (orderDetail == null) {
            throw new BusinessDomainException("Cannot construct an approval without an order");
        }
        if (getId() == null || status == null) {
            throw new BusinessDomainException("Business and approval status are required");
        }
        this.orderApproval = new OrderApproval(
                new OrderApprovalId(UUID.randomUUID()), getId(), orderDetail.getId(), status);
    }

    // ---------- Getters ----------

    public BusinessName getBusinessName() {
        return businessName;
    }

    public BusinessContact getBusinessContact() {
        return businessContact;
    }

    public OrderDetail getOrderDetail() {
        return orderDetail;
    }

    public OrderApproval getOrderApproval() {
        return orderApproval;
    }

    public boolean isActive() {
        return active;
    }

    public List<Product> getProducts() { return products; }

    // ---------- Builder ----------

    private Business(Builder builder) {
        super.setId(builder.id);
        businessName = builder.businessName;
        businessContact = builder.businessContact;
        orderDetail = builder.orderDetail;
        products = builder.products == null ? List.of() : List.copyOf(builder.products);
        orderApproval = builder.orderApproval;
        active = builder.active;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static final class Builder {
        private BusinessId id;
        private BusinessName businessName;
        private BusinessContact businessContact;
        private OrderDetail orderDetail;
        private List<Product> products = List.of();
        private OrderApproval orderApproval;
        private boolean active;

        private Builder() {
        }

        public Builder id(BusinessId val) {
            id = val;
            return this;
        }

        public Builder businessName(BusinessName val) {
            businessName = val;
            return this;
        }

        public Builder businessContact(BusinessContact val) {
            businessContact = val;
            return this;
        }

        public Builder orderDetail(OrderDetail val) {
            orderDetail = val;
            return this;
        }

        public Builder products(List<Product> val) { products = val; return this; }

        public Builder orderApproval(OrderApproval val) {
            orderApproval = val;
            return this;
        }

        public Builder active(boolean val) {
            active = val;
            return this;
        }

        public Business build() {
            return new Business(this);
        }
    }
}
