package kh.eco.istad.platform.customer.config;

import kh.eco.istad.platform.customer.message.CustomerGrpcService;
import io.grpc.Server;
import io.grpc.netty.shaded.io.grpc.netty.NettyServerBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;

@Configuration(proxyBeanMethods = false)
public class CustomerGrpcServerConfig {

    @Bean(initMethod = "start", destroyMethod = "shutdown")
    Server customerGrpcServer(
            CustomerGrpcService customerGrpcService,
            @Value("${customer-service.grpc.port:9090}") int port) throws IOException {
        return NettyServerBuilder.forPort(port)
                .addService(customerGrpcService)
                .build();
    }
}
