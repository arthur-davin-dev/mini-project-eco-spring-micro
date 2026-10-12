package kh.eco.istad.platform.business.restapi.controller;

import jakarta.validation.Valid;
import kh.eco.istad.platform.business.domain.usecase.RegisterBusinessUseCase;
import kh.eco.istad.platform.business.restapi.dto.RegisterBusinessRequest;
import kh.eco.istad.platform.business.restapi.dto.RegisterBusinessResponse;
import kh.eco.istad.platform.business.restapi.mapper.BusinessWebMapper;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/businesses")
public class BusinessController {

    private final RegisterBusinessUseCase registerBusinessUseCase;
    private final BusinessWebMapper mapper;

    public BusinessController(RegisterBusinessUseCase registerBusinessUseCase, BusinessWebMapper mapper) {
        this.registerBusinessUseCase = registerBusinessUseCase;
        this.mapper = mapper;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<RegisterBusinessResponse> registerBusiness(@Valid @RequestBody RegisterBusinessRequest request) {
        return registerBusinessUseCase.execute(mapper.toCommand(request))
                .map(mapper::toResponse);
    }
}