package kh.eco.istad.platform.order.persistence.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.util.UUID;

@Table("order_addresses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderAddressEntity {
    @Id
    private UUID id;
//    @Column("order_id")
//    private UUID orderId;
    private String street;
    @Column("postal_code")
    private String postalCode;
    private String city;
}
