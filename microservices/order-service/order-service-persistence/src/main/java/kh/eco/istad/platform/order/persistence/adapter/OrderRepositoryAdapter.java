package kh.eco.istad.platform.order.persistence.adapter;

import kh.eco.istad.platform.order.domain.entity.Order;
import kh.eco.istad.platform.order.domain.port.out.OrderRepository;
import kh.eco.istad.platform.order.persistence.entity.OrderEntity;
import kh.eco.istad.platform.order.persistence.mapper.OrderPersistenceMapper;
import kh.eco.istad.platform.order.persistence.repository.OrderJpaRepository;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

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
        OrderEntity entity = mapper.toEntity(order);
        orderJpaRepository.findById(order.getId().value())
                .ifPresent(existing -> entity.setIdempotencyKey(existing.getIdempotencyKey()));
        return mapper.toDomain(orderJpaRepository.save(entity));
    }

    @Override
    public Order save(Order order, String idempotencyKey) {
        OrderEntity entity = mapper.toEntity(order);
        entity.setIdempotencyKey(idempotencyKey);
        return mapper.toDomain(orderJpaRepository.save(entity));
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Order> findByIdempotencyKey(String idempotencyKey) {
        return orderJpaRepository.findByIdempotencyKey(idempotencyKey).map(mapper::toDomain);
    }
}
