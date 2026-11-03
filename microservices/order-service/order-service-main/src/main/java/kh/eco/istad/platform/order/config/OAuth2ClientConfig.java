package kh.eco.istad.platform.order.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.client.AuthorizedClientServiceReactiveOAuth2AuthorizedClientManager;
import org.springframework.security.oauth2.client.InMemoryReactiveOAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.ReactiveOAuth2AuthorizedClientManager;
import org.springframework.security.oauth2.client.ReactiveOAuth2AuthorizedClientProvider;
import org.springframework.security.oauth2.client.ReactiveOAuth2AuthorizedClientProviderBuilder;
import org.springframework.security.oauth2.client.ReactiveOAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.annotation.ClientRegistrationId;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.registration.InMemoryReactiveClientRegistrationRepository;
import org.springframework.security.oauth2.client.registration.ReactiveClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.reactive.function.client.support.OAuth2WebClientHttpServiceGroupConfigurer;

@Configuration(proxyBeanMethods = false)

public class OAuth2ClientConfig {

    @Bean
    @ConditionalOnMissingBean(ReactiveClientRegistrationRepository.class)
    ReactiveClientRegistrationRepository reactiveClientRegistrationRepository(
            ClientRegistrationRepository clientRegistrationRepository
    ) {
        var registration = clientRegistrationRepository.findByRegistrationId("customer-service");
        if (registration == null) {
            throw new IllegalStateException("Missing OAuth2 client registration 'customer-service'");
        }
        return new InMemoryReactiveClientRegistrationRepository(registration);
    }

    @Bean
    @ConditionalOnMissingBean(ReactiveOAuth2AuthorizedClientService.class)
    ReactiveOAuth2AuthorizedClientService reactiveOAuth2AuthorizedClientService(
            ReactiveClientRegistrationRepository clientRegistrationRepository
    ) {
        return new InMemoryReactiveOAuth2AuthorizedClientService(clientRegistrationRepository);
    }

    @Bean
    public ReactiveOAuth2AuthorizedClientManager authorizedClientManager(
            ReactiveClientRegistrationRepository clientRegistrationRepository,
            ReactiveOAuth2AuthorizedClientService authorizedClientService
    ) {

        ReactiveOAuth2AuthorizedClientProvider authorizedClientProvider =
                ReactiveOAuth2AuthorizedClientProviderBuilder.builder()
                        .clientCredentials()
                        .build();

        var authorizedClientManager =
                new AuthorizedClientServiceReactiveOAuth2AuthorizedClientManager(
                        clientRegistrationRepository,
                        authorizedClientService
                );

        authorizedClientManager.setAuthorizedClientProvider(
                authorizedClientProvider
        );

        return authorizedClientManager;
    }

    @Bean
    public OAuth2WebClientHttpServiceGroupConfigurer oauth2HttpServiceGroupConfigurer(
            ReactiveOAuth2AuthorizedClientManager authorizedClientManager
    ) {

        return OAuth2WebClientHttpServiceGroupConfigurer.from(
                authorizedClientManager
        );
    }
}
