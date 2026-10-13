package kh.eco.istad.platform.business.persistence.adapter;

import kh.eco.istad.common.domain.valueobject.BusinessId;
import kh.eco.istad.platform.business.domain.entity.Business;
import kh.eco.istad.platform.business.domain.valueobject.BusinessContact;
import kh.eco.istad.platform.business.domain.valueobject.BusinessName;
import kh.eco.istad.platform.business.domain.entity.Product;
import kh.eco.istad.platform.business.domain.valueobject.ProductId;
import kh.eco.istad.common.domain.valueobject.Money;
import kh.eco.istad.platform.business.persistence.document.BusinessDocument;
import kh.eco.istad.platform.business.persistence.repository.BusinessMongoRepository;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.util.UUID;
import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class BusinessRepositoryAdapterTest {

    @Test
    void mapsBusinessToDocumentAndMapsSavedDocumentBack() {
        UUID businessId = UUID.randomUUID();
        Business business = Business.builder()
                .id(new BusinessId(businessId))
                .businessName(new BusinessName("Angkor Burger Co., Ltd", "Angkor Burger"))
                .businessContact(new BusinessContact("HELLO@ANGKORBURGER.COM", "+85512345678"))
                .products(List.of(new Product(new ProductId(UUID.randomUUID()), "Tea", new Money(new BigDecimal("1.25")), 4, true)))
                .active(true)
                .build();

        BusinessMongoRepository mongoRepository = mock(BusinessMongoRepository.class);
        when(mongoRepository.save(any(BusinessDocument.class)))
                .thenAnswer(invocation -> Mono.just(invocation.getArgument(0)));
        BusinessRepositoryAdapter adapter = new BusinessRepositoryAdapter(mongoRepository);

        StepVerifier.create(adapter.save(business))
                .assertNext(saved -> {
                    assertEquals(businessId, saved.getId().value());
                    assertEquals("hello@angkorburger.com", saved.getBusinessContact().email());
                    assertEquals("Angkor Burger", saved.getBusinessName().displayName());
                    assertTrue(saved.isActive());
                    assertEquals(1, saved.getProducts().size());
                    assertEquals(new BigDecimal("1.25"), saved.getProducts().getFirst().getPrice().amount());
                    assertEquals(4, saved.getProducts().getFirst().getQuantity());
                })
                .verifyComplete();

        ArgumentCaptor<BusinessDocument> documentCaptor = ArgumentCaptor.forClass(BusinessDocument.class);
        verify(mongoRepository).save(documentCaptor.capture());
        assertEquals(businessId.toString(), documentCaptor.getValue().getId());
        assertEquals("hello@angkorburger.com", documentCaptor.getValue().getEmail());
        assertEquals(new BigDecimal("1.25"), documentCaptor.getValue().getProducts().getFirst().getPrice());
        assertEquals(business.getProducts().getFirst().getId().value().toString(), documentCaptor.getValue().getProducts().getFirst().getId());
    }
}
