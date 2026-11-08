package kh.eco.istad.platform.order.persistence.entity;

import kh.eco.istad.common.domain.valueobject.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.math.BigDecimal;
import java.util.UUID;

@Table("orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderEntity {
    @Id
    private UUID id;
    @Column("business_id")
    private UUID businessId;
    @Column("customer_id")
    private UUID customerId;
    @Column("failure_messages")
    private String failureMessages;
    @Column("order_status")
    private OrderStatus orderStatus;
    private BigDecimal price;
    @Column("tracking_id")
    private UUID trackingId;
    @Column("order_address_id")
    private UUID orderAddressId;
}
