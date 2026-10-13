package kh.eco.istad.platform.payment.bean;

import kh.eco.istad.platform.payment.domain.service.PaymentDomainService;
import kh.eco.istad.platform.payment.domain.service.PaymentDomainServiceImpl;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class PaymentBeanConfig {
    @Bean
    public PaymentDomainService paymentDomainService() {
        return new PaymentDomainServiceImpl();
    }
}
