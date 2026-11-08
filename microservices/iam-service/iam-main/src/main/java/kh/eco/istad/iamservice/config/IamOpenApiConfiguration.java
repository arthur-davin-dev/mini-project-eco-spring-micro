package kh.eco.istad.iamservice.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springdoc.core.customizers.OpenApiCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class IamOpenApiConfiguration {

    private static final String BEARER_AUTH = "bearerAuth";
    private static final String API_BASE_PATH = "/api/";
    private static final String PUBLIC_REGISTRATION_PATH = "/api/auth/register";

    @Bean
    OpenAPI iamOpenApi() {
        return new OpenAPI()
                .info(new Info().title("IAM Service API").version("v1"))
                .components(new Components().addSecuritySchemes(BEARER_AUTH,
                        new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")));
    }

    @Bean
    OpenApiCustomizer iamBearerSecurityCustomizer() {
        return openApi -> {
            if (openApi.getPaths() == null) {
                return;
            }
            openApi.getPaths().forEach((path, pathItem) -> {
                if (path.startsWith(API_BASE_PATH) && !path.equals(PUBLIC_REGISTRATION_PATH)) {
                    pathItem.readOperations().forEach(operation ->
                            operation.addSecurityItem(new SecurityRequirement().addList(BEARER_AUTH)));
                }
            });
        };
    }
}
