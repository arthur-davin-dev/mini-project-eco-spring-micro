package kh.eco.istad.platform.customer.domain.usecase;

import kh.eco.istad.platform.customer.domain.dto.CustomerResult;
import kh.eco.istad.platform.customer.domain.mapper.CustomerDataMapper;
import kh.eco.istad.platform.customer.domain.port.out.CustomerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class GetCustomersUseCase {

    private final CustomerRepository customerRepository;
    private final CustomerDataMapper mapper;

    public GetCustomersUseCase(CustomerRepository customerRepository, CustomerDataMapper mapper) {
        this.customerRepository = customerRepository;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public List<CustomerResult> execute() {
        return customerRepository.findAll().stream().map(mapper::toResult).toList();
    }
}