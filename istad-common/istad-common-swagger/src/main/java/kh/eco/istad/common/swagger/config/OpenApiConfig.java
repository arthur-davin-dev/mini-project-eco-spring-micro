package kh.eco.istad.common.swagger.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;

@AutoConfiguration
public class OpenApiConfig {

    @Bean
    @ConditionalOnMissingBean(OpenAPI.class)
    OpenAPI istadOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("ISTAD ITE Platform")
                        .description("I Am Atomic"));
    }
}
