package kh.eco.istad.platform.business.domain.usecase;

import kh.eco.istad.common.domain.exception.ResourceNotFoundException;
import kh.eco.istad.common.domain.valueobject.BusinessId;
import kh.eco.istad.platform.business.domain.dto.BusinessResult;
import kh.eco.istad.platform.business.domain.mapper.BusinessDataMapper;
import kh.eco.istad.platform.business.domain.port.out.BusinessRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import java.util.UUID;

@Service
public class GetBusinessUseCase {
    private final BusinessRepository repository;
    private final BusinessDataMapper mapper;
    public GetBusinessUseCase(BusinessRepository repository, BusinessDataMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }
    public Mono<BusinessResult> execute(UUID id) {
        if (id == null) return Mono.error(new IllegalArgumentException("Business id is required"));
        return repository.findById(
                new BusinessId(id)).switchIfEmpty(Mono.error(
                        new ResourceNotFoundException("Business " + id + " not found")))
                .map(mapper::toBusinessResult);
    }
}
