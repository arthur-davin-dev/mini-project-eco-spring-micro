package kh.eco.istad.platform.customer.diagnostics;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Tells the caller WHICH running instance answered.
 * Used in the Eureka lab to prove that load balancing alternates between instances.
 */
@RestController
public class InstanceInfoController {

    private final String applicationName;
    private final String port;

    public InstanceInfoController(
            @Value("${spring.application.name}") String applicationName,
            @Value("${server.port}") String port) {
        this.applicationName = applicationName;
        this.port = port;
    }

    @GetMapping("/api/instance")
    public Map<String, String> instance() {
        return Map.of("service", applicationName, "port", port);
    }
}
