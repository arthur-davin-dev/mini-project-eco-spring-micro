package kh.eco.istad.platform.customer.domain.usecase;

import kh.eco.istad.common.domain.exception.ResourceNotFoundException;
import kh.eco.istad.common.domain.valueobject.CustomerId;
import kh.eco.istad.platform.customer.domain.dto.CustomerResult;
import kh.eco.istad.platform.customer.domain.mapper.CustomerDataMapper;
import kh.eco.istad.platform.customer.domain.port.out.CustomerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class GetCustomerUseCase {

    private final CustomerRepository customerRepository;
    private final CustomerDataMapper mapper;

    public GetCustomerUseCase(CustomerRepository customerRepository, CustomerDataMapper mapper) {
        this.customerRepository = customerRepository;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public CustomerResult execute(UUID customerId) {
        return customerRepository.findById(new CustomerId(customerId))
                .map(mapper::toResult)
                .orElseThrow(() -> new ResourceNotFoundException("Customer " + customerId + " not found"));
    }
}