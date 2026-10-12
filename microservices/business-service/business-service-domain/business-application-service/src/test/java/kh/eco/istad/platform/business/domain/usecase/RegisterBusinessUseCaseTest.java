package kh.eco.istad.platform.business.domain.usecase;

import kh.eco.istad.platform.business.domain.dto.RegisterBusinessCommand;
import kh.eco.istad.platform.business.domain.entity.Business;
import kh.eco.istad.platform.business.domain.exception.BusinessAlreadyExistsException;
import kh.eco.istad.platform.business.domain.exception.BusinessDomainException;
import kh.eco.istad.platform.business.domain.mapper.BusinessDataMapper;
import kh.eco.istad.platform.business.domain.port.out.BusinessRepository;
import kh.eco.istad.platform.business.domain.service.BusinessDomainServiceImpl;
import org.junit.jupiter.api.Test;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.util.HashSet;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class RegisterBusinessUseCaseTest {

    private static class InMemoryBusinessRepository implements BusinessRepository {
        private final Set<String> emails = new HashSet<>();

        @Override
        public Mono<Business> save(Business business) {
            emails.add(business.getBusinessContact().email());
            return Mono.just(business);
        }

        @Override
        public Mono<Boolean> existsByEmail(String email) {
            return Mono.just(emails.contains(email));
        }
    }

    private final RegisterBusinessUseCase useCase = new RegisterBusinessUseCase(
            new BusinessDomainServiceImpl(), new InMemoryBusinessRepository(), new BusinessDataMapper());

    private RegisterBusinessCommand command(String email) {
        return new RegisterBusinessCommand("Angkor Burger Co., Ltd", "Angkor Burger", email, "+85512345678");
    }

    @Test
    void registersBusiness() {
        StepVerifier.create(useCase.execute(command("hello@angkorburger.com")))
                .assertNext(result -> {
                    assertNotNull(result.businessId());
                    assertTrue(result.active());
                    assertEquals("hello@angkorburger.com", result.email());
                })
                .verifyComplete();
    }

    @Test
    void duplicateEmailIsRejected() {
        StepVerifier.create(
                        useCase.execute(command("hello@angkorburger.com"))
                                .then(useCase.execute(command("hello@angkorburger.com"))))
                .expectError(BusinessAlreadyExistsException.class)
                .verify();
    }

    @Test
    void invalidEmailIsRejected() {
        StepVerifier.create(useCase.execute(command("not-an-email")))
                .expectError(BusinessDomainException.class)
                .verify();
    }
}