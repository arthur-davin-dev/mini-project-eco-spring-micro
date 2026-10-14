package kh.eco.istad.platform.order.domain.usecase;

import kh.eco.istad.common.domain.exception.ResourceNotFoundException;
import kh.eco.istad.common.domain.exception.ConflictException;
import kh.eco.istad.common.domain.valueobject.BusinessId;
import kh.eco.istad.common.domain.valueobject.CustomerId;
import kh.eco.istad.common.domain.valueobject.OrderStatus;
import kh.eco.istad.platform.order.domain.dto.CreateOrderCommand;
import kh.eco.istad.platform.order.domain.dto.CreateOrderResult;
import kh.eco.istad.platform.order.domain.entity.Business;
import kh.eco.istad.platform.order.domain.entity.Customer;
import kh.eco.istad.platform.order.domain.entity.Order;
import kh.eco.istad.platform.order.domain.exception.ExternalServiceException;
import kh.eco.istad.platform.order.domain.mapper.OrderDataMapper;
import kh.eco.istad.platform.order.domain.port.out.BusinessRepository;
import kh.eco.istad.platform.order.domain.port.out.CustomerRepository;
import kh.eco.istad.platform.order.domain.port.out.OrderRepository;
import kh.eco.istad.platform.order.domain.port.out.PaymentGateway;
import kh.eco.istad.platform.order.domain.port.out.PaymentGateway.PaymentResult;
import kh.eco.istad.platform.order.domain.service.OrderDomainService;
import org.springframework.stereotype.Service;

@Service
public class CreateOrderUseCase {

    private final OrderDomainService orderDomainService;
    private final OrderRepository orderRepository;
    private final BusinessRepository businessRepository;
    private final CustomerRepository customerRepository;
    private final OrderDataMapper orderDataMapper;
    private final PaymentGateway paymentGateway;

    public CreateOrderUseCase(OrderDomainService orderDomainService,
                              OrderRepository orderRepository,
                              BusinessRepository businessRepository,
                              CustomerRepository customerRepository,
                              OrderDataMapper orderDataMapper,
                              PaymentGateway paymentGateway) {
        this.orderDomainService = orderDomainService;
        this.orderRepository = orderRepository;
        this.businessRepository = businessRepository;
        this.customerRepository = customerRepository;
        this.orderDataMapper = orderDataMapper;
        this.paymentGateway = paymentGateway;
    }

    public CreateOrderResult execute(CreateOrderCommand command) {
        if (command == null) throw new IllegalArgumentException("Order details are required");
        String requestKey = command.idempotencyKey();
        if (requestKey == null || requestKey.isBlank() || requestKey.length() > 128) {
            throw new IllegalArgumentException("Idempotency-Key header must contain 1 to 128 characters");
        }

        Order order = orderRepository.findByIdempotencyKey(requestKey).orElse(null);
        if (order == null) {
            Customer customer = customerRepository.findCustomer(new CustomerId(command.customerId()))
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Customer " + command.customerId() + " not found"));
            customer.validateActive();

            Business business = businessRepository.findBusiness(new BusinessId(command.businessId()))
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Business " + command.businessId() + " not found"));

            order = orderDataMapper.toOrder(command);
            orderDomainService.validateAndInitiateOrder(order, business);
            order = orderRepository.save(order, requestKey);
        }

        if (order.getOrderStatus() == OrderStatus.PAID) {
            return orderDataMapper.toResult(order, "Order already paid");
        }
        if (order.getOrderStatus() != OrderStatus.PENDING) {
            throw new ConflictException("Order is not in a payable state");
        }

        PaymentResult payment = paymentGateway.pay(order.getCustomerId().value(), order.getId().value(),
                order.getPrice(), order.getId().value().toString());
        if (payment == null || payment.paymentId() == null
                || !order.getCustomerId().value().equals(payment.customerId())
                || !order.getId().value().equals(payment.orderId())
                || !order.getPrice().equals(payment.amount())
                || !"COMPLETED".equals(payment.status())) {
            throw new ExternalServiceException("Payment service returned an unexpected payment response");
        }

        orderDomainService.payOrder(order);
        Order paidOrder = orderRepository.save(order);
        return orderDataMapper.toResult(paidOrder, "Order created and paid successfully");
    }
}
