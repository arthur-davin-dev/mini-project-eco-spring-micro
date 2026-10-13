package kh.eco.istad.platform.business.restapi.controller;

import jakarta.validation.Valid;
import kh.eco.istad.platform.business.domain.usecase.RegisterBusinessUseCase;
import kh.eco.istad.platform.business.domain.usecase.GetBusinessUseCase;
import kh.eco.istad.platform.business.domain.usecase.DeactivateBusinessUseCase;
import kh.eco.istad.platform.business.restapi.dto.BusinessResponse;
import kh.eco.istad.platform.business.restapi.dto.RegisterBusinessRequest;
import kh.eco.istad.platform.business.restapi.dto.RegisterBusinessResponse;
import kh.eco.istad.platform.business.restapi.mapper.BusinessWebMapper;
import org.springframework.http.HttpStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import java.util.UUID;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/businesses")
public class BusinessController {

    private final RegisterBusinessUseCase registerBusinessUseCase;
    private final BusinessWebMapper mapper;
    private final GetBusinessUseCase getBusinessUseCase;
    private final DeactivateBusinessUseCase deactivateBusinessUseCase;

    @Autowired
    public BusinessController(RegisterBusinessUseCase registerBusinessUseCase, GetBusinessUseCase getBusinessUseCase,
                              DeactivateBusinessUseCase deactivateBusinessUseCase, BusinessWebMapper mapper) {
        this.registerBusinessUseCase = registerBusinessUseCase;
        this.getBusinessUseCase = getBusinessUseCase;
        this.deactivateBusinessUseCase = deactivateBusinessUseCase;
        this.mapper = mapper;
    }

    public BusinessController(RegisterBusinessUseCase registerBusinessUseCase, BusinessWebMapper mapper) {
        this(registerBusinessUseCase, null, null, mapper);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<RegisterBusinessResponse> registerBusiness(@Valid @RequestBody RegisterBusinessRequest request) {
        return registerBusinessUseCase.execute(mapper.toCommand(request))
                .map(mapper::toResponse);
    }

    @GetMapping("/{id}")
    public Mono<BusinessResponse> getBusiness(@PathVariable("id") UUID id) {
        return getBusinessUseCase.execute(id).map(mapper::toResponse);
    }

    @PatchMapping("/{id}/deactivate")
    public Mono<BusinessResponse> deactivateBusiness(@PathVariable("id") UUID id) {
        return deactivateBusinessUseCase.execute(id).map(mapper::toResponse);
    }
}
