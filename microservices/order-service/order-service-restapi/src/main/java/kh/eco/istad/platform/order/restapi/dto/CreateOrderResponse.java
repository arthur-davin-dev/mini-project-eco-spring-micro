package kh.eco.istad.platform.order.restapi.dto;

import kh.eco.istad.common.domain.valueobject.OrderStatus;

import java.util.UUID;

public record CreateOrderResponse(
        UUID orderId,
        UUID trackingId,
        OrderStatus orderStatus,
        String message) {
}