package kh.eco.istad.platform.customer.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.grpc.server.GlobalServerInterceptor;
import org.springframework.grpc.server.security.AuthenticationProcessInterceptor;
import org.springframework.grpc.server.security.GrpcSecurity;

@Configuration(proxyBeanMethods = false)
public class CustomerGrpcSecurityConfig {

    @Bean
    @GlobalServerInterceptor
    AuthenticationProcessInterceptor customerGrpcSecurity(GrpcSecurity grpc) throws Exception {
        return grpc.authorizeRequests(requests -> requests
                        .methods("customer.v1.CustomerService/GetCustomer").permitAll()
                        .methods("grpc.*/*").permitAll()
                        .allRequests().denyAll())
                .build();
    }
}
