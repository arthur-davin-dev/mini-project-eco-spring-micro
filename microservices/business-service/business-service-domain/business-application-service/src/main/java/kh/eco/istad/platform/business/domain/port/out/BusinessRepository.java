package kh.eco.istad.platform.business.domain.port.out;

import kh.eco.istad.platform.business.domain.entity.Business;
import reactor.core.publisher.Mono;

public interface BusinessRepository {

    Mono<Business> save(Business business);

    Mono<Boolean> existsByEmail(String email);
}