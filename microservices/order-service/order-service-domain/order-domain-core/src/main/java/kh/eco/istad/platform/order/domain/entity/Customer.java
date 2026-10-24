
package kh.eco.istad.platform.order.domain.entity;

import kh.eco.istad.common.domain.entity.AggregateRoot;
import kh.eco.istad.common.domain.valueobject.CustomerId;
import kh.eco.istad.platform.order.domain.exception.OrderDomainException;

public class Customer extends AggregateRoot<CustomerId> {

    private final String username;
    private final String familyName;
    private final String givenName;
    private final boolean active;

    private Customer(Builder builder) {
        super.setId(builder.id);
        this.username = builder.username;
        this.familyName = builder.familyName;
        this.givenName = builder.givenName;
        this.active = builder.active;
    }

    public void validateActive() {
        if (!active) {
            throw new OrderDomainException(
                    "Customer " + getId().value() + " is not active!"
            );
        }
    }

    public boolean isActive() {
        return active;
    }

    public String getUsername() {
        return username;
    }

    public String getFamilyName() {
        return familyName;
    }

    public String getGivenName() {
        return givenName;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static final class Builder {

        private CustomerId id;
        private String username;
        private String familyName;
        private String givenName;
        private boolean active;

        private Builder() {
        }

        public Builder id(CustomerId id) {
            this.id = id;
            return this;
        }

        public Builder username(String username) {
            this.username = username;
            return this;
        }

        public Builder familyName(String familyName) {
            this.familyName = familyName;
            return this;
        }

        public Builder givenName(String givenName) {
            this.givenName = givenName;
            return this;
        }

        public Builder active(boolean active) {
            this.active = active;
            return this;
        }

        public Customer build() {
            return new Customer(this);
        }
    }
}

//public class Customer extends AggregateRoot<CustomerId> {
//
//    private final boolean active;
//
//    public Customer(CustomerId id, boolean active) {
//        super.setId(id);
//        this.active = active;
//    }
//
//    public void validateActive() {
//        if (!active) {
//            throw new OrderDomainException("Customer " + getId().value() + " is not active!");
//        }
//    }
//
//    public boolean isActive() {
//        return active;
//    }
//}