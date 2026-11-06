package kh.eco.istad.platform.order.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientManager;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientProvider;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientProviderBuilder;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.OAuth2AuthorizeRequest;
import org.springframework.security.oauth2.client.AuthorizedClientServiceOAuth2AuthorizedClientManager;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.registration.InMemoryReactiveClientRegistrationRepository;
import org.springframework.security.oauth2.client.registration.ReactiveClientRegistrationRepository;
import org.springframework.security.oauth2.client.ReactiveOAuth2AuthorizedClientManager;
import org.springframework.security.oauth2.client.AuthorizedClientServiceReactiveOAuth2AuthorizedClientManager;
import org.springframework.security.oauth2.client.InMemoryReactiveOAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.ReactiveOAuth2AuthorizedClientProvider;
import org.springframework.security.oauth2.client.ReactiveOAuth2AuthorizedClientProviderBuilder;
import org.springframework.security.oauth2.client.ReactiveOAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.web.reactive.function.client.support.OAuth2WebClientHttpServiceGroupConfigurer;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.AuthorityUtils;
import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;
import build.buf.gen.customer.v1.CustomerServiceGrpc;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpRequest;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.http.client.support.HttpRequestWrapper;

@Configuration(proxyBeanMethods = false)
public class OAuth2ClientConfig {

    @Bean
    @ConditionalOnMissingBean(ReactiveClientRegistrationRepository.class)
    ReactiveClientRegistrationRepository reactiveClientRegistrationRepository(
            ClientRegistrationRepository registrations) {
        var registration = registrations.findByRegistrationId("customer-service");
        if (registration == null) {
            throw new IllegalStateException("Missing OAuth2 client registration 'customer-service'");
        }
        return new InMemoryReactiveClientRegistrationRepository(registration);
    }

    @Bean
    @ConditionalOnMissingBean(ReactiveOAuth2AuthorizedClientService.class)
    ReactiveOAuth2AuthorizedClientService reactiveOAuth2AuthorizedClientService(
            ReactiveClientRegistrationRepository registrations) {
        return new InMemoryReactiveOAuth2AuthorizedClientService(registrations);
    }

    @Bean
    ReactiveOAuth2AuthorizedClientManager reactiveOAuth2AuthorizedClientManager(
            ReactiveClientRegistrationRepository registrations,
            ReactiveOAuth2AuthorizedClientService authorizedClients) {
        var manager = new AuthorizedClientServiceReactiveOAuth2AuthorizedClientManager(registrations, authorizedClients);
        ReactiveOAuth2AuthorizedClientProvider provider = ReactiveOAuth2AuthorizedClientProviderBuilder.builder()
                .clientCredentials()
                .build();
        manager.setAuthorizedClientProvider(provider);
        return manager;
    }

    @Bean
    OAuth2WebClientHttpServiceGroupConfigurer customerOAuth2WebClientConfigurer(
            ReactiveOAuth2AuthorizedClientManager manager) {
        return OAuth2WebClientHttpServiceGroupConfigurer.from(manager);
    }


    @Bean
    OAuth2AuthorizedClientManager oauth2AuthorizedClientManager(
            ClientRegistrationRepository registrations,
            OAuth2AuthorizedClientService authorizedClients) {
        OAuth2AuthorizedClientProvider provider = OAuth2AuthorizedClientProviderBuilder.builder()
                .clientCredentials()
                .build();
        var manager = new AuthorizedClientServiceOAuth2AuthorizedClientManager(registrations, authorizedClients);
        manager.setAuthorizedClientProvider(provider);
        return manager;
    }

    @Bean
    ClientHttpRequestInterceptor customerOAuth2Interceptor(OAuth2AuthorizedClientManager manager) {
        var principal = new UsernamePasswordAuthenticationToken("order-service", "N/A", AuthorityUtils.NO_AUTHORITIES);
        return (request, body, execution) -> {
            var authorizedClient = manager.authorize(OAuth2AuthorizeRequest.withClientRegistrationId("customer-service")
                    .principal(principal)
                    .build());
            if (authorizedClient == null || authorizedClient.getAccessToken() == null) {
                throw new IllegalStateException("Could not obtain an OAuth2 access token for customer-service");
            }
            HttpRequest authorizedRequest = new HttpRequestWrapper(request);
            authorizedRequest.getHeaders().setBearerAuth(authorizedClient.getAccessToken().getTokenValue());
            return execution.execute(authorizedRequest, body);
        };
    }

    @Bean(destroyMethod = "shutdownNow")
    ManagedChannel customerGrpcChannel(
            @Value("${customer-service.grpc.target:localhost:9090}") String target) {
        return ManagedChannelBuilder.forTarget(target)
                .usePlaintext()
                .build();
    }

    @Bean
    CustomerServiceGrpc.CustomerServiceBlockingStub customerServiceBlockingStub(ManagedChannel customerGrpcChannel) {
        return CustomerServiceGrpc.newBlockingStub(customerGrpcChannel);
    }

}
