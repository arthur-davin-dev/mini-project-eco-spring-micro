package kh.eco.istad.platform.order.client.config;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Scope;
import org.springframework.web.client.RestClient;


@Configuration
@ConditionalOnProperty(name = "spring.cloud.discovery.enabled", havingValue = "true")
public class DiscoveryRestClientConfig {

    /**
     * Eureka's own HTTP transport also looks up a RestClient.Builder by type.
     * Make the direct builder the default so registry URLs such as
     * http://localhost:8761 are not sent through service discovery.
     */
    @Bean
    @Primary
    @Scope("prototype")
    public RestClient.Builder restClientBuilder() {
        return RestClient.builder();
    }

    /** Prototype: every injection point gets its own builder instance. */
    @Bean
    @LoadBalanced
    @Scope("prototype")
    public RestClient.Builder loadBalancedRestClientBuilder() {
        return RestClient.builder();
    }

    @Bean
    @Qualifier("customerRestClient")
    public RestClient customerRestClient(
            @LoadBalanced RestClient.Builder builder,
            @Value("${customer-service.base-url}") String baseUrl,
            @Value("${customer-service.timeout-ms:3000}") int timeoutMs) {
        return RestClientSupport.build(builder, baseUrl, timeoutMs);
    }

    @Bean
    @Qualifier("businessRestClient")
    public RestClient businessRestClient(
            @LoadBalanced RestClient.Builder builder,
            @Value("${business-service.base-url}") String baseUrl,
            @Value("${business-service.timeout-ms:3000}") int timeoutMs) {
        return RestClientSupport.build(builder, baseUrl, timeoutMs);
    }

    @Bean
    @Qualifier("paymentRestClient")
    public RestClient paymentRestClient(
            @LoadBalanced RestClient.Builder builder,
            @Value("${payment-service.base-url}") String baseUrl,
            @Value("${payment-service.timeout-ms:3000}") int timeoutMs) {
        return RestClientSupport.build(builder, baseUrl, timeoutMs);
    }
}
