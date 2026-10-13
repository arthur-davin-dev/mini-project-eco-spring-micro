package kh.eco.istad.platform.customer.domain.usecase;

import kh.eco.istad.platform.customer.domain.dto.CustomerResult;
import kh.eco.istad.platform.customer.domain.dto.InitiateCustomerCommand;
import kh.eco.istad.platform.customer.domain.entity.Customer;
import kh.eco.istad.platform.customer.domain.exception.CustomerAlreadyExistsException;
import kh.eco.istad.platform.customer.domain.mapper.CustomerDataMapper;
import kh.eco.istad.platform.customer.domain.port.out.CustomerRepository;
import kh.eco.istad.platform.customer.domain.service.CustomerDomainService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InitiateCustomerUseCase {

    private final CustomerDomainService customerDomainService;
    private final CustomerRepository customerRepository;
    private final CustomerDataMapper mapper;

    public InitiateCustomerUseCase(CustomerDomainService customerDomainService,
                                   CustomerRepository customerRepository,
                                   CustomerDataMapper mapper) {
        this.customerDomainService = customerDomainService;
        this.customerRepository = customerRepository;
        this.mapper = mapper;
    }

    @Transactional
    public CustomerResult execute(InitiateCustomerCommand command) {
        Customer customer = mapper.toCustomer(command);

        if (customerRepository.existsByUsername(customer.getUsername())) {
            throw new CustomerAlreadyExistsException("Username " + customer.getUsername() + " is already in use");
        }
        if (customerRepository.existsByEmail(customer.getEmail().value())) {
            throw new CustomerAlreadyExistsException("Email " + customer.getEmail().value() + " is already in use");
        }

        // The returned CustomerInitiatedEvent is where you would publish to a message broker later.
        customerDomainService.initiateCustomer(customer);

        return mapper.toResult(customerRepository.save(customer));
    }
}