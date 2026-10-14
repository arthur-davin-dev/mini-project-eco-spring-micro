package kh.eco.istad.platform.business.persistence.repository;

import kh.eco.istad.platform.business.persistence.document.BusinessDocument;
import kh.eco.istad.common.domain.valueobject.BusinessId;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import reactor.core.publisher.Mono;

public interface BusinessMongoRepository extends ReactiveMongoRepository<BusinessDocument, BusinessId> {

    Mono<Boolean> existsByEmail(String email);
}
