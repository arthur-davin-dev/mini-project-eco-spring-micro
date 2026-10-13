package kh.eco.istad.platform.order.restapi.mapper;

import kh.eco.istad.platform.order.domain.dto.AddressCommand;
import kh.eco.istad.platform.order.domain.dto.CreateOrderCommand;
import kh.eco.istad.platform.order.domain.dto.CreateOrderResult;
import kh.eco.istad.platform.order.domain.dto.OrderItemCommand;
import kh.eco.istad.platform.order.restapi.dto.CreateOrderRequest;
import kh.eco.istad.platform.order.restapi.dto.CreateOrderResponse;
import org.springframework.stereotype.Component;

@Component
public class OrderWebMapper {

    public CreateOrderCommand toCommand(CreateOrderRequest request) {
        return toCommand(request, null);
    }

    public CreateOrderCommand toCommand(CreateOrderRequest request, String idempotencyKey) {
        return new CreateOrderCommand(
                request.customerId(),
                request.businessId(),
                new AddressCommand(
                        request.address().street(),
                        request.address().postalCode(),
                        request.address().city()),
                request.price(),
                request.items().stream()
                        .map(item -> new OrderItemCommand(
                                item.productId(), item.quantity(), item.price(), item.subTotal()))
                        .toList(),
                idempotencyKey);
    }

    public CreateOrderResponse toResponse(CreateOrderResult result) {
        return new CreateOrderResponse(
                result.orderId(), result.trackingId(), result.orderStatus(), result.message());
    }
}
