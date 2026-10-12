package kh.eco.istad.platform.business.domain.service;

import kh.eco.istad.common.domain.valueobject.Money;
import kh.eco.istad.common.domain.valueobject.OrderId;
import kh.eco.istad.common.domain.valueobject.OrderStatus;
import kh.eco.istad.platform.business.domain.entity.Business;
import kh.eco.istad.platform.business.domain.entity.OrderDetail;
import kh.eco.istad.platform.business.domain.entity.Product;
import kh.eco.istad.platform.business.domain.event.OrderApprovalEvent;
import kh.eco.istad.platform.business.domain.event.OrderApprovedEvent;
import kh.eco.istad.platform.business.domain.event.OrderRejectedEvent;
import kh.eco.istad.platform.business.domain.exception.BusinessDomainException;
import kh.eco.istad.platform.business.domain.valueobject.BusinessContact;
import kh.eco.istad.platform.business.domain.valueobject.BusinessName;
import kh.eco.istad.platform.business.domain.valueobject.OrderApprovalStatus;
import kh.eco.istad.platform.business.domain.valueobject.ProductId;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class BusinessDomainServiceTest {

    private final BusinessDomainService service = new BusinessDomainServiceImpl();

    private Money money(String value) {
        return new Money(new BigDecimal(value));
    }

    private OrderDetail orderDetail(OrderStatus status, boolean productAvailable) {
        Product product = new Product(new ProductId(UUID.randomUUID()), "Burger", money("5.00"), 2, productAvailable);
        return new OrderDetail(new OrderId(UUID.randomUUID()), status, money("10.00"), List.of(product));
    }

    private Business business(OrderDetail detail) {
        Business business = Business.builder()
                .businessName(new BusinessName("Angkor Burger Co., Ltd", "Angkor Burger"))
                .businessContact(new BusinessContact("hello@angkorburger.com", "+85512345678"))
                .orderDetail(detail)
                .build();
        service.validateAndInitiateBusiness(business);
        return business;
    }

    @Test
    void registeredBusinessGetsIdAndIsActive() {
        Business business = business(null);

        assertNotNull(business.getId());
        assertTrue(business.isActive());
    }

    @Test
    void invalidEmailIsRejected() {
        assertThrows(BusinessDomainException.class,
                () -> new BusinessContact("not-an-email", "+85512345678"));
    }

    @Test
    void invalidPhoneIsRejected() {
        assertThrows(BusinessDomainException.class,
                () -> new BusinessContact("hello@angkorburger.com", "abc"));
    }

    @Test
    void blankNameIsRejected() {
        assertThrows(BusinessDomainException.class, () -> new BusinessName(" ", "Angkor Burger"));
    }

    @Test
    void paidOrderWithAvailableProductsIsApproved() {
        Business business = business(orderDetail(OrderStatus.PAID, true));
        List<String> failures = new ArrayList<>();

        OrderApprovalEvent event = service.validateOrder(business, failures);

        assertInstanceOf(OrderApprovedEvent.class, event);
        assertTrue(failures.isEmpty());
        assertEquals(OrderApprovalStatus.APPROVED, business.getOrderApproval().getApprovalStatus());
    }

    @Test
    void unpaidOrderIsRejected() {
        Business business = business(orderDetail(OrderStatus.PENDING, true));
        List<String> failures = new ArrayList<>();

        OrderApprovalEvent event = service.validateOrder(business, failures);

        assertInstanceOf(OrderRejectedEvent.class, event);
        assertFalse(failures.isEmpty());
    }

    @Test
    void unavailableProductIsRejected() {
        Business business = business(orderDetail(OrderStatus.PAID, false));
        List<String> failures = new ArrayList<>();

        OrderApprovalEvent event = service.validateOrder(business, failures);

        assertInstanceOf(OrderRejectedEvent.class, event);
    }
}