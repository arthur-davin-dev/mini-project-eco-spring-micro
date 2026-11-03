package kh.eco.istad.platform.order.persistence.repository;

import kh.eco.istad.platform.order.persistence.entity.OrderEntity;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Mono;
import java.util.UUID;

public interface OrderReactiveRepository extends ReactiveCrudRepository<OrderEntity, UUID> {
    Mono<OrderEntity> findByOrderAddressId(UUID orderAddressId);
}
