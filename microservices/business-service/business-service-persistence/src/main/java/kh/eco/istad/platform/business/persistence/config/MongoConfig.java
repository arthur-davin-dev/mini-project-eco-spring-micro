package kh.eco.istad.platform.business.persistence.config;

import kh.eco.istad.platform.business.persistence.converter.BusinessIdReadConverter;
import kh.eco.istad.platform.business.persistence.converter.BusinessIdWriteConverter;
import kh.eco.istad.platform.business.persistence.converter.ProductIdReadConverter;
import kh.eco.istad.platform.business.persistence.converter.ProductIdWriteConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.core.convert.MongoCustomConversions;

@Configuration
public class MongoConfig {
    @Bean
    public MongoCustomConversions bean(){
        return MongoCustomConversions.create(
                adapter->{
                    adapter.registerConverter(new BusinessIdReadConverter());
                    adapter.registerConverter(new BusinessIdWriteConverter());
                    adapter.registerConverter(new ProductIdReadConverter());
                    adapter.registerConverter(new ProductIdWriteConverter());
                }
        );
    }
}
