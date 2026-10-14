package kh.eco.istad.platform.business.persistence.converter;

import kh.eco.istad.platform.business.domain.valueobject.ProductId;
import org.springframework.core.convert.converter.Converter;
import org.springframework.data.convert.WritingConverter;

@WritingConverter
public class ProductIdWriteConverter implements Converter<ProductId, String> {

    @Override
    public String convert(ProductId source) {
        return source.value().toString();
    }
}
