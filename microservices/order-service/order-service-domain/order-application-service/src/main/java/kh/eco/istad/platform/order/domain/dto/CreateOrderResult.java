package kh.eco.istad.platform.order.domain.dto;

import kh.eco.istad.common.domain.valueobject.OrderStatus;

import java.util.UUID;

public record CreateOrderResult(
        UUID orderId,
        UUID trackingId,
        OrderStatus orderStatus,
        String message) {
}