package kh.eco.istad.platform.business.domain.usecase;

import kh.eco.istad.common.domain.exception.ResourceNotFoundException;
import kh.eco.istad.common.domain.valueobject.BusinessId;
import kh.eco.istad.platform.business.domain.dto.RegisterBusinessCommand;
import kh.eco.istad.platform.business.domain.entity.Business;
import kh.eco.istad.platform.business.domain.mapper.BusinessDataMapper;
import kh.eco.istad.platform.business.domain.port.out.BusinessRepository;
import kh.eco.istad.platform.business.domain.service.BusinessDomainServiceImpl;
import org.junit.jupiter.api.Test;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;
import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import static org.junit.jupiter.api.Assertions.*;

class BusinessUseCasesTest {
    private static class Repository implements BusinessRepository {
        final Map<UUID, Business> businesses = new ConcurrentHashMap<>();
        @Override public Mono<Business> save(Business business) { businesses.put(business.getId().value(), business); return Mono.just(business); }
        @Override public Mono<Boolean> existsByEmail(String email) { return Mono.just(businesses.values().stream().anyMatch(b -> b.getBusinessContact().email().equals(email))); }
        @Override public Mono<Business> findById(BusinessId id) { return Mono.justOrEmpty(businesses.get(id.value())); }
    }
    private final Repository repository = new Repository();
    private final BusinessDataMapper mapper = new BusinessDataMapper();
    private final BusinessDomainServiceImpl domain = new BusinessDomainServiceImpl();
    private RegisterBusinessUseCase register() { return new RegisterBusinessUseCase(domain, repository, mapper); }
    private RegisterBusinessCommand command() { return new RegisterBusinessCommand("Legal", "Shop", "shop@example.com", "+85512345678",
            java.util.List.of(new RegisterBusinessCommand.ProductCommand("Tea", new BigDecimal("1.25"), 5))); }

    @Test void registersProductsAndGeneratesId() {
        StepVerifier.create(register().execute(command())).assertNext(result -> {
            assertEquals(1, result.products().size());
            assertNotNull(result.products().getFirst().productId());
            assertTrue(result.products().getFirst().available());
            assertEquals(new BigDecimal("1.25"), result.products().getFirst().price());
        }).verifyComplete();
    }
    @Test void unknownBusinessIsNotFound() {
        StepVerifier.create(new GetBusinessUseCase(repository, mapper).execute(UUID.randomUUID()))
                .expectError(ResourceNotFoundException.class).verify();
    }
    @Test void deactivatesBusiness() {
        StepVerifier.create(register().execute(command()).flatMap(result ->
                        new DeactivateBusinessUseCase(repository, domain, mapper).execute(result.businessId())))
                .assertNext(result -> assertFalse(result.active())).verifyComplete();
    }
}
