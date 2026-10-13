package kh.eco.istad.platform.order.persistence.adapter;

import kh.eco.istad.common.domain.valueobject.BusinessId;
import kh.eco.istad.common.domain.valueobject.Money;
import kh.eco.istad.platform.order.domain.dto.AddressCommand;
import kh.eco.istad.platform.order.domain.dto.CreateOrderCommand;
import kh.eco.istad.platform.order.domain.dto.OrderItemCommand;
import kh.eco.istad.platform.order.domain.entity.Business;
import kh.eco.istad.platform.order.domain.entity.Order;
import kh.eco.istad.platform.order.domain.entity.Product;
import kh.eco.istad.platform.order.domain.mapper.OrderDataMapper;
import kh.eco.istad.platform.order.domain.service.OrderDomainServiceImpl;
import kh.eco.istad.platform.order.domain.valueobject.ProductId;
import kh.eco.istad.platform.order.persistence.entity.OrderEntity;
import kh.eco.istad.platform.order.persistence.mapper.OrderPersistenceMapper;
import kh.eco.istad.platform.order.persistence.repository.OrderJpaRepository;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class OrderRepositoryAdapterTest {

    @Test
    void mapsOrderToJpaAndMapsSavedOrderBack() {
        UUID businessId = UUID.randomUUID();
        UUID customerId = UUID.randomUUID();
        UUID productId = UUID.randomUUID();
        Product product = new Product(new ProductId(productId), "Burger", new Money(new BigDecimal("5.00")));
        Business business = new Business(new BusinessId(businessId), List.of(product), true);
        CreateOrderCommand command = new CreateOrderCommand(
                customerId,
                businessId,
                new AddressCommand("St 271", "12000", "Phnom Penh"),
                new BigDecimal("10.00"),
                List.of(new OrderItemCommand(productId, 2, new BigDecimal("5.00"), new BigDecimal("10.00"))));
        Order order = new OrderDataMapper().toOrder(command);
        new OrderDomainServiceImpl().validateAndInitiateOrder(order, business);

        OrderJpaRepository jpaRepository = mock(OrderJpaRepository.class);
        when(jpaRepository.save(any(OrderEntity.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        OrderRepositoryAdapter adapter = new OrderRepositoryAdapter(jpaRepository, new OrderPersistenceMapper());

        Order savedOrder = adapter.save(order);

        ArgumentCaptor<OrderEntity> entityCaptor = ArgumentCaptor.forClass(OrderEntity.class);
        verify(jpaRepository).save(entityCaptor.capture());
        OrderEntity savedEntity = entityCaptor.getValue();
        assertEquals(order.getId().value(), savedEntity.getId());
        assertEquals("St 271", savedEntity.getAddress().getStreet());
        assertEquals(productId, savedEntity.getItems().getFirst().getProductId());
        assertNotNull(savedOrder.getTrackingId());
        assertEquals(order.getPrice(), savedOrder.getPrice());
    }
}
