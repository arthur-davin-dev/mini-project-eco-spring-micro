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
    // BusinessDomainService	អនុវត្ត Business Logic ដែលពាក់ព័ន្ធនឹង Domain
    private final BusinessRepository businessRepository;
    // BusinessRepository	Port សម្រាប់ទាក់ទងនឹងការរក្សាទុក និងស្វែងរកទិន្នន័យ
    private final BusinessDataMapper mapper;
    // BusinessDataMapper	បម្លែងទិន្នន័យរវាង Object ផ្សេងៗ

    public RegisterBusinessUseCase(
            BusinessDomainService businessDomainService,
            BusinessRepository businessRepository,
            BusinessDataMapper mapper
    ) {
        this.businessDomainService = businessDomainService;
        this.businessRepository = businessRepository;
        this.mapper = mapper;
    }
    // RegisterBusinessCommand	ផ្ទុកទិន្នន័យដែលត្រូវចុះឈ្មោះ
    // RegisterBusinessResult	ផ្ទុកលទ្ធផលដែលត្រូវបញ្ជូនត្រឡប់
//    public Mono<RegisterBusinessResult> execute(RegisterBusinessCommand command) {
//        // ពន្យារការចាប់ផ្តើមដំណើរការរហូតដល់មាន Subscription
//        return Mono.defer(() -> {
//            if (command == null) throw new IllegalArgumentException("Business details are required");
//            Business business = mapper.toBusiness(command);
//            String email = business.getBusinessContact().email();
//
//            return businessRepository.existsByEmail(email)
//                    .flatMap(exists -> {
//                        if (exists) {
//                            return Mono.error(new BusinessAlreadyExistsException(
//                                    "A business with email " + email + " already exists"));
//                        }
//                        // The returned BusinessRegisteredEvent is where you would publish to a broker later.
//                        businessDomainService.validateAndInitiateBusiness(business);
//                        return businessRepository.save(business);
//                    })
//                    .map(saved -> mapper.toResult(saved, "Business registered successfully"));
//        });
//    }

    public Mono<RegisterBusinessResult> execute(RegisterBusinessCommand command){
        // Mono.defer() បង្កើត Publisher ដែលរង់ចាំរហូតដល់មាន Subscription ទើបចាប់ផ្តើម Execute Logic នៅខាងក្នុង។
        return Mono.defer(()->{
            if (command == null) throw new IllegalArgumentException("Business details are required");
            Business business = mapper.toBusiness(command);
            String email = business.getBusinessContact().email();

            return businessRepository.existsByEmail(email)
                    .flatMap(exists->{
                        if (exists) {
                            return Mono.error(new BusinessAlreadyExistsException(
                                    "A business with email "+ email + "already exists"
                            ));
                        }
                        businessDomainService.validateAndInitiateBusiness(business);
                        return businessRepository.save(business);
                    })
                    .map(saved -> mapper.toResult(saved,"business registered successfully"));
        });
    }
}
