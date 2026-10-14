package kh.eco.istad.platform.business.persistence.converter;

import kh.eco.istad.common.domain.valueobject.BusinessId;
import org.springframework.core.convert.converter.Converter;
import org.springframework.data.convert.WritingConverter;

@WritingConverter
public class BusinessIdWriteConverter implements Converter<BusinessId, String> {
    @Override
    public String convert(BusinessId source) {
        return source.value().toString();
    }
}
