package kh.eco.istad.platform.business.persistence.adapter;

import kh.eco.istad.common.domain.valueobject.BusinessId;
import kh.eco.istad.platform.business.domain.entity.Business;
import kh.eco.istad.platform.business.domain.port.out.BusinessRepository;
import kh.eco.istad.platform.business.domain.valueobject.BusinessContact;
import kh.eco.istad.platform.business.domain.valueobject.BusinessName;
import kh.eco.istad.platform.business.domain.entity.Product;
import kh.eco.istad.common.domain.valueobject.Money;
import kh.eco.istad.platform.business.persistence.document.ProductDocument;
import kh.eco.istad.platform.business.persistence.document.BusinessDocument;
import kh.eco.istad.platform.business.persistence.repository.BusinessMongoRepository;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;
import reactor.core.publisher.Flux;

import java.util.List;

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

    @Override
    public Mono<Business> findById(BusinessId businessId) {
        return mongoRepository.findById(businessId.value().toString()).map(this::toDomain);
    }

    @Override
    public Flux<Business> findAll() {
        return mongoRepository.findAll().map(this::toDomain);
    }

//    private BusinessDocument toDocument(Business business) {
//        return BusinessDocument.builder()
//                .id(business.getId())
//                .legalName(business.getBusinessName().legalName())
//                .displayName(business.getBusinessName().displayName())
//                .email(business.getBusinessContact().email())
//                .phoneNumber(business.getBusinessContact().phoneNumber())
//                .active(business.isActive())
//                .products(business.getProducts().stream().map(product -> ProductDocument.builder()
//                        .id(product.getId()).name(product.getName()).price(product.getPrice().amount())
//                        .quantity(product.getQuantity()).available(product.isAvailable()).build()).toList())
//                .build();
//    }

    private BusinessDocument toDocument(Business business){
        return BusinessDocument.builder()
                .id(business.getId().value().toString())
                .legalName(business.getBusinessName().legalName())
                .displayName(business.getBusinessName().displayName())
                .email(business.getBusinessContact().email())
                .phoneNumber(business.getBusinessContact().phoneNumber())
                .active(business.isActive())
                .products(business.getProducts().stream()
                        .map(product -> ProductDocument.builder()
                                .id(product.getId())
                                .name(product.getName())
                                .price(product.getPrice().amount())
                                .quantity(product.getQuantity())
                                .available(product.isAvailable())
                                .build()
                        ).toList()
                )
                .build();
    }

//    private Business toDomain(BusinessDocument document) {
//        return Business.builder()
//                .id(document.getId())
//                .businessName(new BusinessName(document.getLegalName(), document.getDisplayName()))
//                .businessContact(new BusinessContact(document.getEmail(), document.getPhoneNumber()))
//                .active(document.isActive())
//                .products(document.getProducts() == null ? List.of() : document.getProducts().stream().map(product ->
//                        new Product(product.getId(), product.getName(),
//                                new Money(product.getPrice()), product.getQuantity(), product.isAvailable())).toList())
//                .build();
//    }

    private Business toDomain(BusinessDocument document){
        return Business.builder()
                .id(new BusinessId(java.util.UUID.fromString(document.getId())))
                .businessName(new BusinessName(document.getLegalName(),document.getDisplayName()))
                .businessContact(new BusinessContact(document.getEmail(),document.getPhoneNumber()))
                .active(document.isActive())
                .products(document.getProducts() == null ? List.of(): document.getProducts()
                        .stream()
                        .map(product->
                                new Product(
                                        product.getId(),
                                        product.getName(),
                                        new Money(product.getPrice()),
                                        product.getQuantity(),
                                        product.isAvailable()
                                        )).toList()
                )
                .build();
    }
}
