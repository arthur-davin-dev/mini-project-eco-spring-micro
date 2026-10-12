package kh.eco.istad.platform.order.domain.port.out;

import kh.eco.istad.platform.order.domain.entity.Order;

public interface OrderRepository {

    Order save(Order order);

}