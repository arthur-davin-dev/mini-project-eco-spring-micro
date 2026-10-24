package kh.eco.istad.platform.order.client.config;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
@ConditionalOnProperty(name = "discovery.enabled", havingValue = "false", matchIfMissing = true)
public class RestClientConfig {

    @Bean
    @Qualifier("customerRestClient")
    public RestClient customerRestClient(
            @Value("${services.customer.base-url}") String baseUrl,
            @Value("${services.customer.timeout-ms:3000}") int timeoutMs) {
        return RestClientSupport.build(RestClient.builder(), baseUrl, timeoutMs);
    }

    @Bean
    @Qualifier("businessRestClient")
    public RestClient businessRestClient(
            @Value("${services.business.base-url}") String baseUrl,
            @Value("${services.business.timeout-ms:3000}") int timeoutMs) {
        return RestClientSupport.build(RestClient.builder(), baseUrl, timeoutMs);
    }

    @Bean
    @Qualifier("paymentRestClient")
    public RestClient paymentRestClient(
            @Value("${services.payment.base-url}") String baseUrl,
            @Value("${services.payment.timeout-ms:3000}") int timeoutMs) {
        return RestClientSupport.build(RestClient.builder(), baseUrl, timeoutMs);
    }
}
