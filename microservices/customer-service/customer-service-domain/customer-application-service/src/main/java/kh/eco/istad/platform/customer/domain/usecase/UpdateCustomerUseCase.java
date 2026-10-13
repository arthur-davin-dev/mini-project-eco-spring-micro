package kh.eco.istad.platform.customer.domain.usecase;

import kh.eco.istad.common.domain.exception.ResourceNotFoundException;
import kh.eco.istad.common.domain.valueobject.CustomerId;
import kh.eco.istad.platform.customer.domain.dto.CustomerResult;
import kh.eco.istad.platform.customer.domain.dto.UpdateCustomerCommand;
import kh.eco.istad.platform.customer.domain.entity.Customer;
import kh.eco.istad.platform.customer.domain.exception.CustomerAlreadyExistsException;
import kh.eco.istad.platform.customer.domain.mapper.CustomerDataMapper;
import kh.eco.istad.platform.customer.domain.port.out.CustomerRepository;
import kh.eco.istad.platform.customer.domain.service.CustomerDomainService;
import kh.eco.istad.platform.customer.domain.valueobject.Email;
import kh.eco.istad.platform.customer.domain.valueobject.PhoneNumber;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UpdateCustomerUseCase {

    private final CustomerDomainService customerDomainService;
    private final CustomerRepository customerRepository;
    private final CustomerDataMapper mapper;

    public UpdateCustomerUseCase(CustomerDomainService customerDomainService,
                                 CustomerRepository customerRepository,
                                 CustomerDataMapper mapper) {
        this.customerDomainService = customerDomainService;
        this.customerRepository = customerRepository;
        this.mapper = mapper;
    }

    @Transactional
    public CustomerResult execute(UpdateCustomerCommand command) {
        Customer customer = customerRepository.findById(new CustomerId(command.customerId()))
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Customer " + command.customerId() + " not found"));

        Email newEmail = new Email(command.email());
        PhoneNumber newPhone = new PhoneNumber(command.phoneNumber());

        if (!customer.getEmail().equals(newEmail) && customerRepository.existsByEmail(newEmail.value())) {
            throw new CustomerAlreadyExistsException("Email " + newEmail.value() + " is already in use");
        }

        customerDomainService.updateCustomer(
                customer, command.familyName(), command.givenName(), newEmail, newPhone);

        return mapper.toResult(customerRepository.save(customer));
    }
}