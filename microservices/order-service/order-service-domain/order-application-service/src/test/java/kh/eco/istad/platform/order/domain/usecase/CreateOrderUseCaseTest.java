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
import kh.eco.istad.platform.order.domain.entity.Order;
import kh.eco.istad.platform.order.domain.entity.Product;
import kh.eco.istad.platform.order.domain.exception.ExternalServiceException;
import kh.eco.istad.platform.order.domain.exception.OrderDomainException;
import kh.eco.istad.platform.order.domain.exception.PaymentRejectedException;
import kh.eco.istad.platform.order.domain.mapper.OrderDataMapper;
import kh.eco.istad.platform.order.domain.port.out.BusinessRepository;
import kh.eco.istad.platform.order.domain.port.out.CustomerRepository;
import kh.eco.istad.platform.order.domain.port.out.OrderRepository;
import kh.eco.istad.platform.order.domain.port.out.PaymentGateway;
import kh.eco.istad.platform.order.domain.service.OrderDomainServiceImpl;
import kh.eco.istad.platform.order.domain.valueobject.ProductId;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

class CreateOrderUseCaseTest {

    private static final UUID CUSTOMER = UUID.randomUUID();
    private static final UUID BUSINESS = UUID.randomUUID();
    private static final UUID PRODUCT = UUID.randomUUID();
    private static final String REQUEST_KEY = "checkout-001";

    private final CustomerRepository customers = id -> Optional.of(new Customer(id, true));
    private final BusinessRepository businesses = id -> Optional.of(new Business(
            id,
            List.of(new Product(new ProductId(PRODUCT), "Burger", new Money(new BigDecimal("5.00")))),
            true));

    private CreateOrderUseCase useCase(OrderRepository orderRepository, PaymentGateway paymentGateway,
                                       CustomerRepository customerRepository, BusinessRepository businessRepository) {
        return new CreateOrderUseCase(new OrderDomainServiceImpl(), orderRepository, businessRepository,
                customerRepository, new OrderDataMapper(), paymentGateway);
    }

    private CreateOrderCommand command() {
        return new CreateOrderCommand(CUSTOMER, BUSINESS,
                new AddressCommand("St 271", "12000", "Phnom Penh"),
                new BigDecimal("999.00"),
                List.of(new OrderItemCommand(PRODUCT, 2, new BigDecimal("5.00"), new BigDecimal("10.00"))),
                REQUEST_KEY);
    }

    @Test
    void createsAndPaysUsingCatalogTotal() {
        InMemoryOrders orders = new InMemoryOrders();
        RecordingPayment payment = new RecordingPayment();

        CreateOrderResult result = useCase(orders, payment, customers, businesses).execute(command());

        assertNotNull(result.orderId());
        assertEquals(OrderStatus.PAID, result.orderStatus());
        assertEquals(new BigDecimal("10.00"), payment.amount.amount());
        assertEquals(result.orderId().toString(), payment.key);
        assertEquals(OrderStatus.PAID, orders.findByIdempotencyKey(REQUEST_KEY).orElseThrow().getOrderStatus());
    }

    @Test
    void insufficientCreditLeavesPendingAndRetryPaysSameOrder() {
        InMemoryOrders orders = new InMemoryOrders();
        RecordingPayment payment = new RecordingPayment();
        payment.failure = new PaymentRejectedException("Insufficient credit");
        CreateOrderUseCase useCase = useCase(orders, payment, customers, businesses);

        assertThrows(PaymentRejectedException.class, () -> useCase.execute(command()));
        Order pending = orders.findByIdempotencyKey(REQUEST_KEY).orElseThrow();
        assertEquals(OrderStatus.PENDING, pending.getOrderStatus());
        UUID orderId = pending.getId().value();

        payment.failure = null;
        CreateOrderResult result = useCase.execute(command());

        assertEquals(orderId, result.orderId());
        assertEquals(OrderStatus.PAID, result.orderStatus());
        assertEquals(2, payment.calls);
    }

    @Test
    void timeoutLeavesPendingAndRetryUsesStablePaymentIdentity() {
        InMemoryOrders orders = new InMemoryOrders();
        RecordingPayment payment = new RecordingPayment();
        payment.failure = new ExternalServiceException("Payment timed out", new RuntimeException("timeout"));
        CreateOrderUseCase useCase = useCase(orders, payment, customers, businesses);

        assertThrows(ExternalServiceException.class, () -> useCase.execute(command()));
        UUID firstOrderId = orders.findByIdempotencyKey(REQUEST_KEY).orElseThrow().getId().value();
        assertEquals(OrderStatus.PENDING, orders.findByIdempotencyKey(REQUEST_KEY).orElseThrow().getOrderStatus());

        payment.failure = null;
        CreateOrderResult result = useCase.execute(command());

        assertEquals(firstOrderId, result.orderId());
        assertEquals(firstOrderId.toString(), payment.key);
        assertEquals(OrderStatus.PAID, result.orderStatus());
    }

    @Test
    void repeatingSuccessfulRequestDoesNotCallPaymentAgain() {
        InMemoryOrders orders = new InMemoryOrders();
        RecordingPayment payment = new RecordingPayment();
        CreateOrderUseCase useCase = useCase(orders, payment, customers, businesses);

        CreateOrderResult first = useCase.execute(command());
        CreateOrderResult second = useCase.execute(command());

        assertEquals(first.orderId(), second.orderId());
        assertEquals(OrderStatus.PAID, second.orderStatus());
        assertEquals(1, payment.calls);
    }

    @Test
    void paymentUnexpectedResponseNeverMarksOrderPaid() {
        InMemoryOrders orders = new InMemoryOrders();
        PaymentGateway invalidResponse = (customerId, orderId, amount, key) ->
                new PaymentGateway.PaymentResult(UUID.randomUUID(), customerId, orderId,
                        new Money(new BigDecimal("0.01")), "COMPLETED");
        CreateOrderUseCase useCase = useCase(orders, invalidResponse, customers, businesses);

        assertThrows(ExternalServiceException.class, () -> useCase.execute(command()));
        assertEquals(OrderStatus.PENDING,
                orders.findByIdempotencyKey(REQUEST_KEY).orElseThrow().getOrderStatus());
    }

    @Test
    void unknownCustomerIsNotFound() {
        CustomerRepository none = id -> Optional.empty();

        assertThrows(ResourceNotFoundException.class,
                () -> useCase(new InMemoryOrders(), new RecordingPayment(), none, businesses).execute(command()));
    }

    @Test
    void inactiveCustomerIsRejected() {
        CustomerRepository inactive = id -> Optional.of(new Customer(id, false));

        assertThrows(OrderDomainException.class,
                () -> useCase(new InMemoryOrders(), new RecordingPayment(), inactive, businesses).execute(command()));
    }

    @Test
    void unknownBusinessIsNotFound() {
        BusinessRepository none = id -> Optional.empty();

        assertThrows(ResourceNotFoundException.class,
                () -> useCase(new InMemoryOrders(), new RecordingPayment(), customers, none).execute(command()));
    }

    private static final class RecordingPayment implements PaymentGateway {
        private int calls;
        private Money amount;
        private String key;
        private RuntimeException failure;

        @Override
        public PaymentResult pay(UUID customerId, UUID orderId, Money requestedAmount, String idempotencyKey) {
            calls++;
            amount = requestedAmount;
            key = idempotencyKey;
            if (failure != null) {
                throw failure;
            }
            return new PaymentResult(UUID.randomUUID(), customerId, orderId, requestedAmount, "COMPLETED");
        }
    }

    private static final class InMemoryOrders implements OrderRepository {
        private final Map<UUID, Order> byId = new HashMap<>();
        private final Map<String, UUID> idempotencyKeys = new HashMap<>();

        @Override
        public Order save(Order order) {
            byId.put(order.getId().value(), order);
            return order;
        }

        @Override
        public Order save(Order order, String key) {
            idempotencyKeys.put(key, order.getId().value());
            return save(order);
        }

        @Override
        public Optional<Order> findByIdempotencyKey(String key) {
            UUID id = idempotencyKeys.get(key);
            return Optional.ofNullable(id == null ? null : byId.get(id));
        }
    }
}
