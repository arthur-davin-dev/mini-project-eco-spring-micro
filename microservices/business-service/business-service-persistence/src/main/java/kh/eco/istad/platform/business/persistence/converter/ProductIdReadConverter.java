package kh.eco.istad.platform.business.persistence.converter;

import kh.eco.istad.platform.business.domain.valueobject.ProductId;
import org.springframework.core.convert.converter.Converter;
import org.springframework.data.convert.ReadingConverter;

import java.util.UUID;

@ReadingConverter
public class ProductIdReadConverter implements Converter<String, ProductId> {

    @Override
    public ProductId convert(String source) {
        return new ProductId(UUID.fromString(source));
    }
}
