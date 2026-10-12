package kh.eco.istad.platform.business.persistence.repository;

import kh.eco.istad.platform.business.persistence.document.BusinessDocument;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import reactor.core.publisher.Mono;

public interface BusinessMongoRepository extends ReactiveMongoRepository<BusinessDocument, String> {

    Mono<Boolean> existsByEmail(String email);
}