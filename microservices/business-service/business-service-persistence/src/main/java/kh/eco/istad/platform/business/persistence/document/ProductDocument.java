package kh.eco.istad.platform.business.persistence.document;

import kh.eco.istad.platform.business.domain.valueobject.ProductId;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductDocument {
    private ProductId id;
    private String name;
    private BigDecimal price;
    private int quantity;
    private boolean available;
}
