package kh.eco.istad.platform.business.persistence.adapter;

import kh.eco.istad.common.domain.valueobject.BusinessId;
import kh.eco.istad.platform.business.domain.entity.Business;
import kh.eco.istad.platform.business.domain.port.out.BusinessRepository;
import kh.eco.istad.platform.business.domain.valueobject.BusinessContact;
import kh.eco.istad.platform.business.domain.valueobject.BusinessName;
import kh.eco.istad.platform.business.persistence.document.BusinessDocument;
import kh.eco.istad.platform.business.persistence.repository.BusinessMongoRepository;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Component
public class BusinessRepositoryAdapter implements BusinessRepository {

    private final BusinessMongoRepository mongoRepository;

    public BusinessRepositoryAdapter(BusinessMongoRepository mongoRepository) {
        this.mongoRepository = mongoRepository;
    }

    @Override
    public Mono<Business> save(Business business) {
        return mongoRepository.save(toDocument(business)).map(this::toDomain);
    }

    @Override
    public Mono<Boolean> existsByEmail(String email) {
        return mongoRepository.existsByEmail(email);
    }

    private BusinessDocument toDocument(Business business) {
        return BusinessDocument.builder()
                .id(business.getId().value().toString())
                .legalName(business.getBusinessName().legalName())
                .displayName(business.getBusinessName().displayName())
                .email(business.getBusinessContact().email())
                .phoneNumber(business.getBusinessContact().phoneNumber())
                .active(business.isActive())
                .build();
    }

    private Business toDomain(BusinessDocument document) {
        return Business.builder()
                .id(new BusinessId(UUID.fromString(document.getId())))
                .businessName(new BusinessName(document.getLegalName(), document.getDisplayName()))
                .businessContact(new BusinessContact(document.getEmail(), document.getPhoneNumber()))
                .active(document.isActive())
                .build();
    }
}