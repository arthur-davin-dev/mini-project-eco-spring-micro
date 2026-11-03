package kh.eco.istad.platform.order.persistence.repository;

import kh.eco.istad.platform.order.persistence.entity.OrderItemEntity;
import kh.eco.istad.platform.order.persistence.entity.OrderItemEntityId;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.data.repository.query.Param;
import reactor.core.publisher.Flux;

import java.util.UUID;

public interface OrderItemReactiveRepository extends R2dbcRepository<OrderItemEntity, OrderItemEntityId> {

    @Query("SELECT * FROM order_items WHERE order_id = :orderId")
    Flux<OrderItemEntity> findAllByOrderId(@Param("orderId") UUID orderId);
}
