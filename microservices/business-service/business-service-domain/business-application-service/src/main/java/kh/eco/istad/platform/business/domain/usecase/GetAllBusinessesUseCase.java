package kh.eco.istad.platform.business.domain.usecase;

import kh.eco.istad.platform.business.domain.dto.BusinessResult;
import kh.eco.istad.platform.business.domain.mapper.BusinessDataMapper;
import kh.eco.istad.platform.business.domain.port.out.BusinessRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

@Service
public class GetAllBusinessesUseCase {

    private final BusinessRepository repository;
    private final BusinessDataMapper mapper;

    public GetAllBusinessesUseCase(BusinessRepository repository, BusinessDataMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

//    public Flux<BusinessResult> execute() {
//        return repository.findAll().map(mapper::toBusinessResult);
//    }
    public Flux<BusinessResult> execute(){
        return repository
                .findAll()
                .map(mapper::toBusinessResult);
    }
}
