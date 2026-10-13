package kh.eco.istad.platform.order.domain.port.out;

import kh.eco.istad.platform.order.domain.entity.Order;

import java.util.Optional;

public interface OrderRepository {

    Order save(Order order);

    default Order save(Order order, String idempotencyKey) {
        return save(order);
    }

    default Optional<Order> findByIdempotencyKey(String idempotencyKey) {
        return Optional.empty();
    }
}
