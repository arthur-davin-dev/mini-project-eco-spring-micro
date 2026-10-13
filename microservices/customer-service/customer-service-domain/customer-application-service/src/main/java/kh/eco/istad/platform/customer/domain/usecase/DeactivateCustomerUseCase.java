package kh.eco.istad.platform.customer.domain.usecase;

import kh.eco.istad.common.domain.exception.ResourceNotFoundException;
import kh.eco.istad.common.domain.valueobject.CustomerId;
import kh.eco.istad.platform.customer.domain.dto.CustomerResult;
import kh.eco.istad.platform.customer.domain.entity.Customer;
import kh.eco.istad.platform.customer.domain.mapper.CustomerDataMapper;
import kh.eco.istad.platform.customer.domain.port.out.CustomerRepository;
import kh.eco.istad.platform.customer.domain.service.CustomerDomainService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class DeactivateCustomerUseCase {

    private final CustomerDomainService customerDomainService;
    private final CustomerRepository customerRepository;
    private final CustomerDataMapper mapper;

    public DeactivateCustomerUseCase(CustomerDomainService customerDomainService,
                                     CustomerRepository customerRepository,
                                     CustomerDataMapper mapper) {
        this.customerDomainService = customerDomainService;
        this.customerRepository = customerRepository;
        this.mapper = mapper;
    }

    @Transactional
    public CustomerResult execute(UUID customerId) {
        Customer customer = customerRepository.findById(new CustomerId(customerId))
                .orElseThrow(() -> new ResourceNotFoundException("Customer " + customerId + " not found"));

        customerDomainService.deactivateCustomer(customer);

        return mapper.toResult(customerRepository.save(customer));
    }
}