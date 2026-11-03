package kh.eco.istad.platform.order;

import kh.eco.istad.platform.order.client.httpclient.CustomerHttpClient;
import kh.eco.istad.platform.order.config.ServicePropConfig;
import kh.eco.istad.platform.order.domain.dto.QueryCustomerResult;
import kh.eco.istad.platform.order.domain.out.client.CustomerServiceClient;
import kh.eco.istad.platform.order.domain.out.client.CustomerServiceClient.CustomerInfo;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.Map;

@RefreshScope
@RestController
@RequiredArgsConstructor
public class WebFluxController {

//    private final CustomerServiceClient customerServiceClient;
    private final ServicePropConfig servicePropConfig;
    private final CustomerHttpClient customerHttpClient;
//    @GetMapping(value = "/customers", produces = "application/json")
//    public Flux<CustomerInfo> getCustomers() {
//        return customerServiceClient.getCustomers();
//    }

    @GetMapping(value = "/customers")
    public Flux<QueryCustomerResult> getCustomers() {
        return customerHttpClient.queryCustomer();
    }

//    @GetMapping(value = "/customers/{id}", produces = "application/json")
//    public Mono<QueryCustomerResult> getCustomerById(
//            @PathVariable String id
//    ) {
//        return customerHttpClient.findCustomerById(id);
//    }

    @GetMapping(value = "/customer/{id}")
    public Mono<QueryCustomerResult> getCustomerById(
            @PathVariable String id
    ){
        return customerHttpClient.findCustomerById(id);
    }



    @GetMapping("/flux")
    public Flux<String> getFluxData() {
        return Flux.just("A", "B", "C", "D", "E", "F")
                .log()
                .delayElements(Duration.ofSeconds(1));
    }

    @Value("${global.version}")
    private String globalVersion;
    @GetMapping("/consul/config")
    public Mono<Map<String, Object>> getConsulConfig() {
        return Mono.just(
                Map.of(
                        "message", servicePropConfig.getMessage(),
                        "env", servicePropConfig.getEnv(),
                        "version", servicePropConfig.getVersion(),
                        "globalVersion", globalVersion,
                        "baseUrl", servicePropConfig.getBaseUrl()
                )
        );
    }
}
