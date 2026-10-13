package kh.eco.istad.platform.customer.restapi.controller;

import jakarta.validation.Valid;
import kh.eco.istad.platform.customer.domain.usecase.DeactivateCustomerUseCase;
import kh.eco.istad.platform.customer.domain.usecase.GetCustomerUseCase;
import kh.eco.istad.platform.customer.domain.usecase.GetCustomersUseCase;
import kh.eco.istad.platform.customer.domain.usecase.InitiateCustomerUseCase;
import kh.eco.istad.platform.customer.domain.usecase.UpdateCustomerUseCase;
import kh.eco.istad.platform.customer.restapi.dto.CreateCustomerRequest;
import kh.eco.istad.platform.customer.restapi.dto.CustomerResponse;
import kh.eco.istad.platform.customer.restapi.dto.UpdateCustomerRequest;
import kh.eco.istad.platform.customer.restapi.mapper.CustomerWebMapper;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final InitiateCustomerUseCase initiateCustomerUseCase;
    private final UpdateCustomerUseCase updateCustomerUseCase;
    private final DeactivateCustomerUseCase deactivateCustomerUseCase;
    private final GetCustomerUseCase getCustomerUseCase;
    private final GetCustomersUseCase getCustomersUseCase;
    private final CustomerWebMapper mapper;

    public CustomerController(InitiateCustomerUseCase initiateCustomerUseCase,
                              UpdateCustomerUseCase updateCustomerUseCase,
                              DeactivateCustomerUseCase deactivateCustomerUseCase,
                              GetCustomerUseCase getCustomerUseCase,
                              GetCustomersUseCase getCustomersUseCase,
                              CustomerWebMapper mapper) {
        this.initiateCustomerUseCase = initiateCustomerUseCase;
        this.updateCustomerUseCase = updateCustomerUseCase;
        this.deactivateCustomerUseCase = deactivateCustomerUseCase;
        this.getCustomerUseCase = getCustomerUseCase;
        this.getCustomersUseCase = getCustomersUseCase;
        this.mapper = mapper;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CustomerResponse createCustomer(@Valid @RequestBody CreateCustomerRequest request) {
        return mapper.toResponse(initiateCustomerUseCase.execute(mapper.toCommand(request)));
    }

    @GetMapping
    public List<CustomerResponse> getCustomers() {
        return getCustomersUseCase.execute().stream().map(mapper::toResponse).toList();
    }

    @GetMapping("/{id}")
    public CustomerResponse getCustomer(@PathVariable("id") UUID id) {
        return mapper.toResponse(getCustomerUseCase.execute(id));
    }

    @PutMapping("/{id}")
    public CustomerResponse updateCustomer(@PathVariable("id") UUID id,
                                           @Valid @RequestBody UpdateCustomerRequest request) {
        return mapper.toResponse(updateCustomerUseCase.execute(mapper.toCommand(id, request)));
    }

    @PatchMapping("/{id}/deactivate")
    public CustomerResponse deactivateCustomer(@PathVariable("id") UUID id) {
        return mapper.toResponse(deactivateCustomerUseCase.execute(id));
    }
}