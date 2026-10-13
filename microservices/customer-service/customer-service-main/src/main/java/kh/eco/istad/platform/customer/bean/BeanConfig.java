package kh.eco.istad.platform.customer.bean;

import kh.eco.istad.platform.customer.domain.service.CustomerDomainService;
import kh.eco.istad.platform.customer.domain.service.CustomerDomainServiceImpl;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class BeanConfig {

    @Bean
    public CustomerDomainService customerDomainService() {
        return new CustomerDomainServiceImpl();
    }
}