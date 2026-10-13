package kh.eco.istad.platform.business.restapi.controller;

import kh.eco.istad.platform.business.domain.dto.RegisterBusinessCommand;
import kh.eco.istad.platform.business.domain.dto.RegisterBusinessResult;
import kh.eco.istad.platform.business.domain.usecase.RegisterBusinessUseCase;
import kh.eco.istad.platform.business.domain.usecase.GetBusinessUseCase;
import kh.eco.istad.platform.business.domain.usecase.DeactivateBusinessUseCase;
import kh.eco.istad.platform.business.restapi.exception.ReactiveGlobalExceptionHandler;
import kh.eco.istad.platform.business.restapi.mapper.BusinessWebMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringBootConfiguration;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.webflux.test.autoconfigure.WebFluxTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.reactive.server.WebTestClient;
import reactor.core.publisher.Mono;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@WebFluxTest(BusinessController.class)
@Import({BusinessController.class, BusinessWebMapper.class, ReactiveGlobalExceptionHandler.class})
@ContextConfiguration(classes = BusinessControllerTest.TestApplication.class)
class BusinessControllerTest {

    @SpringBootConfiguration
    @EnableAutoConfiguration
    static class TestApplication {
    }

    @Autowired
    private WebTestClient webTestClient;

    @MockitoBean
    private RegisterBusinessUseCase registerBusinessUseCase;

    @MockitoBean
    private GetBusinessUseCase getBusinessUseCase;

    @MockitoBean
    private DeactivateBusinessUseCase deactivateBusinessUseCase;

    @Test
    void registersBusinessAndReturnsCreated() {
        UUID businessId = UUID.randomUUID();
        when(registerBusinessUseCase.execute(any(RegisterBusinessCommand.class)))
                .thenReturn(Mono.just(new RegisterBusinessResult(
                        businessId,
                        "Angkor Burger Co., Ltd",
                        "Angkor Burger",
                        "hello@angkorburger.com",
                        "+85512345678",
                        true,
                        "Business registered successfully")));

        webTestClient.post()
                .uri("/api/businesses")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(validBusinessJson())
                .exchange()
                .expectStatus().isCreated()
                .expectBody()
                .jsonPath("$.businessId").isEqualTo(businessId.toString())
                .jsonPath("$.active").isEqualTo(true);
    }

    @Test
    void rejectsMissingEmailAsBadRequest() {
        webTestClient.post()
                .uri("/api/businesses")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue("""
                        {
                          "legalName": "Angkor Burger Co., Ltd",
                          "displayName": "Angkor Burger",
                          "phoneNumber": "+85512345678"
                        }
                        """)
                .exchange()
                .expectStatus().isBadRequest()
                .expectBody()
                .jsonPath("$.message").isEqualTo("Validation failed")
                .jsonPath("$.errors.email").isEqualTo("email is required");
    }

    private String validBusinessJson() {
        return """
                {
                  "legalName": "Angkor Burger Co., Ltd",
                  "displayName": "Angkor Burger",
                  "email": "hello@angkorburger.com",
                  "phoneNumber": "+85512345678"
                }
                """;
    }
}
