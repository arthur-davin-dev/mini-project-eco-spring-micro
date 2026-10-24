package kh.eco.istad.platform.order.diagnostics;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.cloud.client.ServiceInstance;
import org.springframework.cloud.client.discovery.DiscoveryClient;
import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/discovery")
@ConditionalOnProperty(name = "discovery.enabled", havingValue = "true")
public class DiscoveryDemoController {

    private static final Set<String> ALLOWED = Set.of("customer-service", "business-service", "payment-service");

    private final DiscoveryClient discoveryClient;
    private final RestClient restClient;

    public DiscoveryDemoController(DiscoveryClient discoveryClient,
                                   @LoadBalanced RestClient.Builder loadBalancedBuilder) {
        this.discoveryClient = discoveryClient;
        this.restClient = loadBalancedBuilder.build();
    }

    @GetMapping("/services")
    public Map<String, List<String>> services() {
        Map<String, List<String>> result = new LinkedHashMap<>();
        for (String serviceId : discoveryClient.getServices()) {
            result.put(serviceId, discoveryClient.getInstances(serviceId).stream()
                    .map(DiscoveryDemoController::describe)
                    .toList());
        }
        return result;
    }

    @GetMapping("/ping/{service}")
    public List<Object> ping(@PathVariable("service") String service,
                             @RequestParam(name = "times", defaultValue = "6") int times) {
        if (!ALLOWED.contains(service)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown service: " + service);
        }
        int calls = Math.min(Math.max(times, 1), 50);
        List<Object> answers = new ArrayList<>();
        for (int i = 1; i <= calls; i++) {
            try {
                Map<?, ?> body = restClient.get()
                        .uri("http://" + service + "/api/instance")
                        .retrieve()
                        .body(Map.class);
                answers.add(Map.of("call", i, "answeredBy", body));
            } catch (RestClientException | IllegalStateException ex) {
                answers.add(Map.of("call", i, "error", ex.getClass().getSimpleName() + ": " + ex.getMessage()));
            }
        }
        return answers;
    }

    private static String describe(ServiceInstance instance) {
        return instance.getHost() + ":" + instance.getPort();
    }
}
