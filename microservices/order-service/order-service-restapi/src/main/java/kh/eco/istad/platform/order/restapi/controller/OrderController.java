package kh.eco.istad.platform.order.restapi.controller;

import jakarta.validation.Valid;
import kh.eco.istad.platform.order.domain.dto.CreateOrderResult;
import kh.eco.istad.platform.order.domain.usecase.CreateOrderUseCase;
import kh.eco.istad.platform.order.restapi.dto.CreateOrderRequest;
import kh.eco.istad.platform.order.restapi.dto.CreateOrderResponse;
import kh.eco.istad.platform.order.restapi.mapper.OrderWebMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final CreateOrderUseCase createOrderUseCase;
    private final OrderWebMapper mapper;

    public OrderController(CreateOrderUseCase createOrderUseCase, OrderWebMapper mapper) {
        this.createOrderUseCase = createOrderUseCase;
        this.mapper = mapper;
    }

    @PostMapping
    public ResponseEntity<CreateOrderResponse> createOrder(@Valid @RequestBody CreateOrderRequest request) {
        CreateOrderResult result = createOrderUseCase.execute(mapper.toCommand(request));
        return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toResponse(result));
    }
}