package kh.eco.istad.platform.order.persistence.adapter;

import kh.eco.istad.common.domain.valueobject.CustomerId;
import kh.eco.istad.platform.order.domain.entity.Customer;
import kh.eco.istad.platform.order.domain.port.out.CustomerRepository;
import kh.eco.istad.platform.order.persistence.mapper.OrderPersistenceMapper;
import kh.eco.istad.platform.order.persistence.repository.CustomerJpaRepository;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class CustomerRepositoryAdapter implements CustomerRepository {

    private final CustomerJpaRepository customerJpaRepository;
    private final OrderPersistenceMapper mapper;

    public CustomerRepositoryAdapter(CustomerJpaRepository customerJpaRepository, OrderPersistenceMapper mapper) {
        this.customerJpaRepository = customerJpaRepository;
        this.mapper = mapper;
    }

    @Override
    public Optional<Customer> findCustomer(CustomerId customerId) {
        return customerJpaRepository.findById(customerId.value())
                .map(entity -> mapper.toDomain(entity));
    }
}