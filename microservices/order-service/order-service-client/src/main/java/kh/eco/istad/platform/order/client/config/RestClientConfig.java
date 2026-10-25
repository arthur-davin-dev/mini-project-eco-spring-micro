package kh.eco.istad.platform.order.client.config;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
@ConditionalOnProperty(name = "spring.cloud.discovery.enabled", havingValue = "false", matchIfMissing = true)
public class RestClientConfig {

    @Bean
    @Qualifier("customerRestClient")
    public RestClient customerRestClient(
            @Value("${customer-service.base-url}") String baseUrl,
            @Value("${customer-service.timeout-ms:3000}") int timeoutMs) {
        return RestClientSupport.build(RestClient.builder(), baseUrl, timeoutMs);
    }

    @Bean
    @Qualifier("businessRestClient")
    public RestClient businessRestClient(
            @Value("${business-service.base-url}") String baseUrl,
            @Value("${business-service.timeout-ms:3000}") int timeoutMs) {
        return RestClientSupport.build(RestClient.builder(), baseUrl, timeoutMs);
    }

    @Bean
    @Qualifier("paymentRestClient")
    public RestClient paymentRestClient(
            @Value("${payment-service.base-url}") String baseUrl,
            @Value("${payment-service.timeout-ms:3000}") int timeoutMs) {
        return RestClientSupport.build(RestClient.builder(), baseUrl, timeoutMs);
    }
}
