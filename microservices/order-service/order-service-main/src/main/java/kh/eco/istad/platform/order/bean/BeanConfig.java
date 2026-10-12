package kh.eco.istad.platform.order.bean;

import kh.eco.istad.platform.order.domain.service.OrderDomainService;
import kh.eco.istad.platform.order.domain.service.OrderDomainServiceImpl;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class BeanConfig {

    @Bean
    public OrderDomainService orderDomainService() {
        return new OrderDomainServiceImpl();
    }
}