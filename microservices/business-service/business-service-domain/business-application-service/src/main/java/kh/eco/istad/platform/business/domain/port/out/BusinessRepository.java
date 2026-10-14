package kh.eco.istad.platform.business.domain.port.out;

import kh.eco.istad.platform.business.domain.entity.Business;
import reactor.core.publisher.Mono;
import reactor.core.publisher.Flux;
import kh.eco.istad.common.domain.valueobject.BusinessId;

public interface BusinessRepository {

    Mono<Business> save(Business business);

    Mono<Boolean> existsByEmail(String email);

    default Mono<Business> findById(BusinessId businessId) { return Mono.empty(); }

    default Flux<Business> findAll() { return Flux.empty(); }
}
