package kh.eco.istad.platform.order.restapi.controller;

import jakarta.validation.Valid;
import kh.eco.istad.common.domain.exception.DomainException;
import kh.eco.istad.platform.order.domain.dto.CreateOrderResult;
import kh.eco.istad.platform.order.domain.entity.Order;
import kh.eco.istad.platform.order.domain.usecase.CreateOrderUseCase;
import kh.eco.istad.platform.order.restapi.dto.CreateOrderRequest;
import kh.eco.istad.platform.order.restapi.dto.CreateOrderResponse;
import kh.eco.istad.platform.order.restapi.mapper.OrderWebMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final CreateOrderUseCase createOrderUseCase;
    private final OrderWebMapper mapper;

    public OrderController(CreateOrderUseCase createOrderUseCase, OrderWebMapper mapper) {
        this.createOrderUseCase = createOrderUseCase;
        this.mapper = mapper;
    }
    @GetMapping
    public Flux<Order> findAll(){
        throw new DomainException("I am Single");
    }

    @PostMapping
    public ResponseEntity<CreateOrderResponse> createOrder(
            @Valid @RequestBody CreateOrderRequest request) {
        CreateOrderResult result = createOrderUseCase.execute(mapper.toCommand(request));
        return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toResponse(result));
    }
}
