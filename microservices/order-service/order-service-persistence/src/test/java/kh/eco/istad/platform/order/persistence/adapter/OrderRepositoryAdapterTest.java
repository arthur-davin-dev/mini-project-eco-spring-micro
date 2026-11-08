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
import kh.eco.istad.platform.order.persistence.mapper.OrderPersistenceMapper;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;

class OrderRepositoryAdapterTest {
    @Test
    void mapsOrderToR2dbcRowsAndBack() {
        UUID businessId = UUID.randomUUID();
        UUID customerId = UUID.randomUUID();
        UUID productId = UUID.randomUUID();
        UUID addressId = UUID.randomUUID();
        Product product = new Product(new ProductId(productId), "Burger", new Money(new BigDecimal("5.00")));
        Business business = new Business(new BusinessId(businessId), List.of(product), true);
        CreateOrderCommand command = new CreateOrderCommand(customerId, businessId,
                new AddressCommand(addressId, "St 271", "12000", "Phnom Penh"), new BigDecimal("10.00"),
                List.of(new OrderItemCommand(productId, 2, new BigDecimal("5.00"), new BigDecimal("10.00"))));
        Order order = new OrderDataMapper().toOrder(command);
        new OrderDomainServiceImpl().validateAndInitiateOrder(order, business);

        OrderPersistenceMapper mapper = new OrderPersistenceMapper();
        Order mapped = mapper.toDomain(mapper.toOrderEntity(order), mapper.toAddressEntity(order),
                mapper.toItemEntities(order));

        assertEquals(order.getId(), mapped.getId());
        assertEquals("St 271", mapped.getDeliveryAddress().street());
        assertEquals(productId, mapped.getItems().getFirst().getProduct().getId().value());
        assertEquals(order.getPrice(), mapped.getPrice());
    }
}
