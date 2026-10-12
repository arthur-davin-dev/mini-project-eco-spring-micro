package kh.eco.istad.platform.order.persistence.adapter;

import kh.eco.istad.platform.order.domain.entity.Order;
import kh.eco.istad.platform.order.domain.port.out.OrderRepository;
import kh.eco.istad.platform.order.persistence.mapper.OrderPersistenceMapper;
import kh.eco.istad.platform.order.persistence.repository.OrderJpaRepository;
import org.springframework.stereotype.Component;

@Component
public class OrderRepositoryAdapter implements OrderRepository {

    private final OrderJpaRepository orderJpaRepository;
    private final OrderPersistenceMapper mapper;

    public OrderRepositoryAdapter(OrderJpaRepository orderJpaRepository, OrderPersistenceMapper mapper) {
        this.orderJpaRepository = orderJpaRepository;
        this.mapper = mapper;
    }

    @Override
    public Order save(Order order) {
        return mapper.toDomain(orderJpaRepository.save(mapper.toEntity(order)));
    }
}