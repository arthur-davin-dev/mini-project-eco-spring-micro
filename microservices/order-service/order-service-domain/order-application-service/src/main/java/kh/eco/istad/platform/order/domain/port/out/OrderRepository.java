package kh.eco.istad.platform.order.domain.port.out;

import kh.eco.istad.platform.order.domain.entity.Order;

import java.util.Optional;
import java.util.UUID;

public interface OrderRepository {

    Order save(Order order);

    default Optional<Order> findByOrderAddressId(UUID orderAddressId) {
        return Optional.empty();
    }
}
