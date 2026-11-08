package kh.eco.istad.platform.order.persistence.repository;

import kh.eco.istad.platform.order.persistence.entity.OrderAddressEntity;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import java.util.UUID;

public interface OrderAddressReactiveRepository extends ReactiveCrudRepository<OrderAddressEntity, UUID> {
}
