package kh.eco.istad.platform.business.persistence.converter;

import kh.eco.istad.common.domain.valueobject.BusinessId;
import org.springframework.core.convert.converter.Converter;
import org.springframework.data.convert.ReadingConverter;

import java.util.UUID;
@ReadingConverter
public class BusinessIdReadConverter implements Converter<String, BusinessId> {

    @Override
    public BusinessId convert(String source) {
        return new BusinessId(UUID.fromString(source));
    }
}
