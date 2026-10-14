package kh.eco.istad.platform.business.domain.entity;

import kh.eco.istad.common.domain.valueobject.Money;
import kh.eco.istad.common.domain.exception.ConflictException;
import kh.eco.istad.platform.business.domain.exception.BusinessDomainException;
import kh.eco.istad.platform.business.domain.service.BusinessDomainServiceImpl;
import kh.eco.istad.platform.business.domain.valueobject.BusinessContact;
import kh.eco.istad.platform.business.domain.valueobject.BusinessName;
import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;

class BusinessCatalogTest {
    private Business business(List<Product> products) {
        return Business.builder().businessName(new BusinessName("Legal", "Shop"))
                .businessContact(new BusinessContact("shop@example.com", "+85512345678")).products(products).build();
    }
    @Test void initializesProductIdsAndAvailability() {
        Product product = new Product(null, "Tea", new Money(new BigDecimal("1.25")), 3, true);
        Business b = business(List.of(product));
        new BusinessDomainServiceImpl().validateAndInitiateBusiness(b);
        assertNotNull(product.getId());
        assertTrue(product.isAvailable());
    }
    @Test void rejectsInvalidProducts() {
        assertThrows(BusinessDomainException.class, () -> new BusinessDomainServiceImpl()
                .validateAndInitiateBusiness(business(List.of(new Product(null, " ", new Money(BigDecimal.ONE), 1, true)))));
        assertThrows(BusinessDomainException.class, () -> new BusinessDomainServiceImpl()
                .validateAndInitiateBusiness(business(List.of(new Product(null, "Tea", Money.ZERO, 1, true)))));
        assertThrows(BusinessDomainException.class, () -> new BusinessDomainServiceImpl()
                .validateAndInitiateBusiness(business(List.of(new Product(null, "Tea", new Money(BigDecimal.ONE), -1, false)))));
    }
    @Test void deactivatesOnce() {
        Business b = business(List.of());
        new BusinessDomainServiceImpl().validateAndInitiateBusiness(b);
        assertNotNull(new BusinessDomainServiceImpl().deactivateBusiness(b));
        assertFalse(b.isActive());
        assertThrows(ConflictException.class, () -> b.deactivate());
    }
}
