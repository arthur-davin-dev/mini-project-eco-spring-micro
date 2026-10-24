package kh.eco.istad.platform.order.client.config;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Scope;
import org.springframework.web.client.RestClient;


@Configuration
@ConditionalOnProperty(name = "discovery.enabled", havingValue = "true")
public class DiscoveryRestClientConfig {

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
            @Value("${services.customer.base-url}") String baseUrl,
            @Value("${services.customer.timeout-ms:3000}") int timeoutMs) {
        return RestClientSupport.build(builder, baseUrl, timeoutMs);
    }

    @Bean
    @Qualifier("businessRestClient")
    public RestClient businessRestClient(
            @LoadBalanced RestClient.Builder builder,
            @Value("${services.business.base-url}") String baseUrl,
            @Value("${services.business.timeout-ms:3000}") int timeoutMs) {
        return RestClientSupport.build(builder, baseUrl, timeoutMs);
    }

    @Bean
    @Qualifier("paymentRestClient")
    public RestClient paymentRestClient(
            @LoadBalanced RestClient.Builder builder,
            @Value("${services.payment.base-url}") String baseUrl,
            @Value("${services.payment.timeout-ms:3000}") int timeoutMs) {
        return RestClientSupport.build(builder, baseUrl, timeoutMs);
    }
}
