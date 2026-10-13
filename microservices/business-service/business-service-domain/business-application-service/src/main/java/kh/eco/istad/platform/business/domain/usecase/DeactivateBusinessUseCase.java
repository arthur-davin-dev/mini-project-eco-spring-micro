package kh.eco.istad.platform.business.domain.usecase;

import kh.eco.istad.common.domain.exception.ResourceNotFoundException;
import kh.eco.istad.common.domain.valueobject.BusinessId;
import kh.eco.istad.platform.business.domain.dto.BusinessResult;
import kh.eco.istad.platform.business.domain.mapper.BusinessDataMapper;
import kh.eco.istad.platform.business.domain.port.out.BusinessRepository;
import kh.eco.istad.platform.business.domain.service.BusinessDomainService;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import java.util.UUID;

@Service
public class DeactivateBusinessUseCase {
    private final BusinessRepository repository;
    private final BusinessDomainService domainService;
    private final BusinessDataMapper mapper;
    public DeactivateBusinessUseCase(
            BusinessRepository repository,
            BusinessDomainService domainService,
            BusinessDataMapper mapper
    )
    {
        this.repository = repository;
        this.domainService = domainService;
        this.mapper = mapper;
    }
    public Mono<BusinessResult> execute(UUID id) {
        return repository.findById(
                new BusinessId(id)).switchIfEmpty(Mono.error(
                        new ResourceNotFoundException("Business " + id + " not found")))
                .flatMap(business -> {
                    domainService.deactivateBusiness(business);
                    return repository.save(business);
                }).map(mapper::toBusinessResult);
    }
}
