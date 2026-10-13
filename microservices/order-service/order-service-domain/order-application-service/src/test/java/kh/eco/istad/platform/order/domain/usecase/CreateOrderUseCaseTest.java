package kh.eco.istad.platform.order.domain.usecase;

import kh.eco.istad.common.domain.exception.ResourceNotFoundException;
import kh.eco.istad.common.domain.valueobject.Money;
import kh.eco.istad.common.domain.valueobject.OrderStatus;
import kh.eco.istad.platform.order.domain.dto.AddressCommand;
import kh.eco.istad.platform.order.domain.dto.CreateOrderCommand;
import kh.eco.istad.platform.order.domain.dto.CreateOrderResult;
import kh.eco.istad.platform.order.domain.dto.OrderItemCommand;
import kh.eco.istad.platform.order.domain.entity.Business;
import kh.eco.istad.platform.order.domain.entity.Customer;
import kh.eco.istad.platform.order.domain.entity.Product;
import kh.eco.istad.platform.order.domain.exception.OrderDomainException;
import kh.eco.istad.platform.order.domain.mapper.OrderDataMapper;
import kh.eco.istad.platform.order.domain.port.out.BusinessRepository;
import kh.eco.istad.platform.order.domain.port.out.CustomerRepository;
import kh.eco.istad.platform.order.domain.port.out.OrderRepository;
import kh.eco.istad.platform.order.domain.service.OrderDomainServiceImpl;
import kh.eco.istad.platform.order.domain.valueobject.ProductId;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

class CreateOrderUseCaseTest {

    private static final UUID CUSTOMER = UUID.randomUUID();
    private static final UUID BUSINESS = UUID.randomUUID();
    private static final UUID PRODUCT = UUID.randomUUID();

    private final CustomerRepository customers = id -> Optional.of(new Customer(id, true));
    private final BusinessRepository businesses = id -> Optional.of(new Business(
            id,
            List.of(new Product(new ProductId(PRODUCT), "Burger", new Money(new BigDecimal("5.00")))),
            true));
    private final OrderRepository orders = order -> order;

    private CreateOrderUseCase useCase(CustomerRepository customerRepo, BusinessRepository businessRepo) {
        return new CreateOrderUseCase(
                new OrderDomainServiceImpl(), orders, businessRepo, customerRepo, new OrderDataMapper());
    }

    private CreateOrderCommand command() {
        return new CreateOrderCommand(
                CUSTOMER,
                BUSINESS,
                new AddressCommand("St 271", "12000", "Phnom Penh"),
                new BigDecimal("10.00"),
                List.of(new OrderItemCommand(PRODUCT, 2, new BigDecimal("5.00"), new BigDecimal("10.00"))));
    }

    @Test
    void createsPendingOrder() {
        CreateOrderResult result = useCase(customers, businesses).execute(command());

        assertNotNull(result.orderId());
        assertNotNull(result.trackingId());
        assertEquals(OrderStatus.PENDING, result.orderStatus());
    }

    @Test
    void unknownCustomerIsNotFound() {
        CustomerRepository none = id -> Optional.empty();

        assertThrows(ResourceNotFoundException.class,
                () -> useCase(none, businesses).execute(command()));
    }

    @Test
    void inactiveCustomerIsRejected() {
        CustomerRepository inactive = id -> Optional.of(new Customer(id, false));

        assertThrows(OrderDomainException.class,
                () -> useCase(inactive, businesses).execute(command()));
    }

    @Test
    void unknownBusinessIsNotFound() {
        BusinessRepository none = id -> Optional.empty();

        assertThrows(ResourceNotFoundException.class,
                () -> useCase(customers, none).execute(command()));
    }
}