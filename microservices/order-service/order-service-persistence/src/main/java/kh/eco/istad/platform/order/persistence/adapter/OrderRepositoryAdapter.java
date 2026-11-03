package kh.eco.istad.platform.order.persistence.adapter;

import kh.eco.istad.platform.order.domain.entity.Order;
import kh.eco.istad.platform.order.domain.port.out.OrderRepository;
import kh.eco.istad.platform.order.persistence.entity.OrderAddressEntity;
import kh.eco.istad.platform.order.persistence.entity.OrderEntity;
import kh.eco.istad.platform.order.persistence.mapper.OrderPersistenceMapper;
import kh.eco.istad.platform.order.persistence.repository.OrderAddressReactiveRepository;
import kh.eco.istad.platform.order.persistence.repository.OrderItemReactiveRepository;
import kh.eco.istad.platform.order.persistence.repository.OrderReactiveRepository;
import org.springframework.data.r2dbc.core.R2dbcEntityTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.ReactiveTransactionManager;
import org.springframework.transaction.reactive.TransactionalOperator;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.Optional;
import java.util.UUID;

@Component
public class OrderRepositoryAdapter implements OrderRepository {

    private final OrderReactiveRepository orders;
    private final OrderAddressReactiveRepository addresses;
    private final OrderItemReactiveRepository items;
    private final OrderPersistenceMapper mapper;
    private final TransactionalOperator transactions;
    private final R2dbcEntityTemplate template;

    public OrderRepositoryAdapter(
            OrderReactiveRepository orders,
            OrderAddressReactiveRepository addresses,
            OrderItemReactiveRepository items,
            OrderPersistenceMapper mapper,
            ReactiveTransactionManager transactionManager,
            R2dbcEntityTemplate template
    ) {
        this.orders = orders;
        this.addresses = addresses;
        this.items = items;
        this.mapper = mapper;
        this.transactions = TransactionalOperator.create(transactionManager);
        this.template = template;
    }

    @Override
    public Order save(Order order) {
        OrderEntity orderEntity = mapper.toOrderEntity(order);
        return persist(order, orderEntity)
                .as(transactions::transactional)
                .block();
    }

    private Mono<Order> persist(Order order, OrderEntity orderEntity) {
        OrderAddressEntity addressEntity = mapper.toAddressEntity(order);

        return deleteExistingItems(orderEntity.getId())
                .then(deleteExistingOrderAndAddress(orderEntity.getId()))
                // orders.order_address_id has a foreign key to order_addresses.id.
                .then(template.insert(addressEntity))
                .then(template.insert(orderEntity))
                .flatMap(savedOrder -> Flux.fromIterable(mapper.toItemEntities(order))
                        .concatMap(template::insert)
                        .collectList()
                        .map(savedItems -> mapper.toDomain(savedOrder, addressEntity, savedItems)));
    }

    private Mono<Void> deleteExistingItems(UUID orderId) {
        return items.findAllByOrderId(orderId)
                .collectList()
                .flatMap(items::deleteAll);
    }

    private Mono<Void> deleteExistingOrderAndAddress(UUID orderId) {
        return orders.findById(orderId)
                .flatMap(existingOrder -> orders.deleteById(orderId)
                        .then(deleteAddress(existingOrder.getOrderAddressId())))
                .then();
    }

    private Mono<Void> deleteAddress(UUID addressId) {
        return addressId == null ? Mono.empty() : addresses.deleteById(addressId);
    }

    @Override
    public Optional<Order> findByOrderAddressId(UUID orderAddressId) {
        return orders.findByOrderAddressId(orderAddressId)
                .flatMap(orderEntity -> Mono.zip(
                                addresses.findById(orderEntity.getOrderAddressId()),
                                items.findAllByOrderId(orderEntity.getId()).collectList())
                        .map(related -> mapper.toDomain(orderEntity, related.getT1(), related.getT2())))
                .as(transactions::transactional)
                .blockOptional();
    }
}
