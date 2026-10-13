//package kh.eco.istad.platform.order.domain.usecase;
//
//import kh.eco.istad.common.domain.exception.ResourceNotFoundException;
//import kh.eco.istad.common.domain.valueobject.BusinessId;
//import kh.eco.istad.common.domain.valueobject.CustomerId;
//import kh.eco.istad.platform.order.domain.dto.CreateOrderCommand;
//import kh.eco.istad.platform.order.domain.dto.CreateOrderResult;
//import kh.eco.istad.platform.order.domain.entity.Business;
//import kh.eco.istad.platform.order.domain.entity.Order;
//import kh.eco.istad.platform.order.domain.mapper.OrderDataMapper;
//import kh.eco.istad.platform.order.domain.port.out.BusinessRepository;
//import kh.eco.istad.platform.order.domain.port.out.CustomerRepository;
//import kh.eco.istad.platform.order.domain.port.out.OrderRepository;
//import kh.eco.istad.platform.order.domain.service.OrderDomainService;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//@Service
//public class CreateOrderUseCase {
//
//    private final OrderDomainService orderDomainService;
//    private final OrderRepository orderRepository;
//    private final BusinessRepository businessRepository;
//    private final CustomerRepository customerRepository;
//    private final OrderDataMapper orderDataMapper;
//
//    public CreateOrderUseCase(OrderDomainService orderDomainService,
//                              OrderRepository orderRepository,
//                              BusinessRepository businessRepository,
//                              CustomerRepository customerRepository,
//                              OrderDataMapper orderDataMapper) {
//        this.orderDomainService = orderDomainService;
//        this.orderRepository = orderRepository;
//        this.businessRepository = businessRepository;
//        this.customerRepository = customerRepository;
//        this.orderDataMapper = orderDataMapper;
//    }
//
//    @Transactional
//    public CreateOrderResult execute(CreateOrderCommand command) {
//        customerRepository.findCustomer(new CustomerId(command.customerId()))
//                .orElseThrow(() -> new ResourceNotFoundException(
//                        "Customer " + command.customerId() + " not found"));
//
//        Business business = businessRepository.findBusiness(new BusinessId(command.businessId()))
//                .orElseThrow(() -> new ResourceNotFoundException(
//                        "Business " + command.businessId() + " not found"));
//
//        Order order = orderDataMapper.toOrder(command);
//
//        // The returned OrderCreatedEvent is where you would publish to a message broker later.
//        orderDomainService.validateAndInitiateOrder(order, business);
//
//        Order savedOrder = orderRepository.save(order);
//
//        return orderDataMapper.toResult(savedOrder, "Order created successfully");
//    }
//}



package kh.eco.istad.platform.order.domain.usecase;

import kh.eco.istad.common.domain.exception.ResourceNotFoundException;
import kh.eco.istad.common.domain.valueobject.BusinessId;
import kh.eco.istad.common.domain.valueobject.CustomerId;
import kh.eco.istad.platform.order.domain.dto.CreateOrderCommand;
import kh.eco.istad.platform.order.domain.dto.CreateOrderResult;
import kh.eco.istad.platform.order.domain.entity.Business;
import kh.eco.istad.platform.order.domain.entity.Customer;
import kh.eco.istad.platform.order.domain.entity.Order;
import kh.eco.istad.platform.order.domain.mapper.OrderDataMapper;
import kh.eco.istad.platform.order.domain.port.out.BusinessRepository;
import kh.eco.istad.platform.order.domain.port.out.CustomerRepository;
import kh.eco.istad.platform.order.domain.port.out.OrderRepository;
import kh.eco.istad.platform.order.domain.service.OrderDomainService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CreateOrderUseCase {

    private final OrderDomainService orderDomainService;
    private final OrderRepository orderRepository;
    private final BusinessRepository businessRepository;
    private final CustomerRepository customerRepository;
    private final OrderDataMapper orderDataMapper;

    public CreateOrderUseCase(OrderDomainService orderDomainService,
                              OrderRepository orderRepository,
                              BusinessRepository businessRepository,
                              CustomerRepository customerRepository,
                              OrderDataMapper orderDataMapper) {
        this.orderDomainService = orderDomainService;
        this.orderRepository = orderRepository;
        this.businessRepository = businessRepository;
        this.customerRepository = customerRepository;
        this.orderDataMapper = orderDataMapper;
    }

    @Transactional
    public CreateOrderResult execute(CreateOrderCommand command) {
        Customer customer = customerRepository.findCustomer(new CustomerId(command.customerId()))
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Customer " + command.customerId() + " not found"));
        customer.validateActive();

        Business business = businessRepository.findBusiness(new BusinessId(command.businessId()))
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Business " + command.businessId() + " not found"));

        Order order = orderDataMapper.toOrder(command);

        // The returned OrderCreatedEvent is where you would publish to a message broker later.
        orderDomainService.validateAndInitiateOrder(order, business);

        Order savedOrder = orderRepository.save(order);

        return orderDataMapper.toResult(savedOrder, "Order created successfully");
    }
}