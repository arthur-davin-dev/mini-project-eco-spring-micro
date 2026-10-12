package kh.eco.istad.platform.business.domain.usecase;

import kh.eco.istad.platform.business.domain.dto.RegisterBusinessCommand;
import kh.eco.istad.platform.business.domain.dto.RegisterBusinessResult;
import kh.eco.istad.platform.business.domain.entity.Business;
import kh.eco.istad.platform.business.domain.exception.BusinessAlreadyExistsException;
import kh.eco.istad.platform.business.domain.mapper.BusinessDataMapper;
import kh.eco.istad.platform.business.domain.port.out.BusinessRepository;
import kh.eco.istad.platform.business.domain.service.BusinessDomainService;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
public class RegisterBusinessUseCase {

    private final BusinessDomainService businessDomainService;
    private final BusinessRepository businessRepository;
    private final BusinessDataMapper mapper;

    public RegisterBusinessUseCase(
            BusinessDomainService businessDomainService,
            BusinessRepository businessRepository,
            BusinessDataMapper mapper
    ) {
        this.businessDomainService = businessDomainService;
        this.businessRepository = businessRepository;
        this.mapper = mapper;
    }

    public Mono<RegisterBusinessResult> execute(RegisterBusinessCommand command) {
        return Mono.defer(() -> {
            Business business = mapper.toBusiness(command);
            String email = business.getBusinessContact().email();

            return businessRepository.existsByEmail(email)
                    .flatMap(exists -> {
                        if (exists) {
                            return Mono.error(new BusinessAlreadyExistsException(
                                    "A business with email " + email + " already exists"));
                        }
                        // The returned BusinessRegisteredEvent is where you would publish to a broker later.
                        businessDomainService.validateAndInitiateBusiness(business);
                        return businessRepository.save(business);
                    })
                    .map(saved -> mapper.toResult(saved, "Business registered successfully"));
        });
    }
}