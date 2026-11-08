package kh.eco.istad.platform.order.persistence.entity;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.util.UUID;

@Table("customers")
@Getter
@Setter
@NoArgsConstructor
public class CustomerEntity {
    @Id
    private UUID id;
    private String firstName;
    private String givenName;
    private String userName;
}
