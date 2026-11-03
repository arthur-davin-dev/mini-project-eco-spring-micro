package kh.eco.istad.platform.order.persistence.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Embedded;
import org.springframework.data.relational.core.mapping.Table;

import java.math.BigDecimal;
import java.util.UUID;

@Table("order_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemEntity {

    @Id
    @Embedded.Nullable
    private OrderItemEntityId orderItemEntityId;

    @Column("product_id")
    private UUID productId;
    private BigDecimal price;
    private Integer quantity;
    @Column("sub_total")
    private BigDecimal subTotal;
}
