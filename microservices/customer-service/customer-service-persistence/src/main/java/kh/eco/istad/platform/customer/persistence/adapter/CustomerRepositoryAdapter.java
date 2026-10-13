package kh.eco.istad.platform.customer.persistence.adapter;

import kh.eco.istad.common.domain.valueobject.CustomerId;
import kh.eco.istad.platform.customer.domain.entity.Customer;
import kh.eco.istad.platform.customer.domain.port.out.CustomerRepository;
import kh.eco.istad.platform.customer.domain.valueobject.Email;
import kh.eco.istad.platform.customer.domain.valueobject.PhoneNumber;
import kh.eco.istad.platform.customer.persistence.entity.CustomerEntity;
import kh.eco.istad.platform.customer.persistence.repository.CustomerJpaRepository;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class CustomerRepositoryAdapter implements CustomerRepository {

    private final CustomerJpaRepository jpaRepository;

    public CustomerRepositoryAdapter(CustomerJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public Customer save(Customer customer) {
        return toDomain(jpaRepository.save(toEntity(customer)));
    }

    @Override
    public Optional<Customer> findById(CustomerId id) {
        return jpaRepository.findById(id.value()).map(this::toDomain);
    }

    @Override
    public List<Customer> findAll() {
        return jpaRepository.findAll().stream().map(this::toDomain).toList();
    }

    @Override
    public boolean existsByUsername(String username) {
        return jpaRepository.existsByUsername(username);
    }

    @Override
    public boolean existsByEmail(String email) {
        return jpaRepository.existsByEmail(email);
    }

    private CustomerEntity toEntity(Customer customer) {
        return CustomerEntity.builder()
                .id(customer.getId().value())
                .username(customer.getUsername())
                .familyName(customer.getFamilyName())
                .givenName(customer.getGivenName())
                .email(customer.getEmail().value())
                .phoneNumber(customer.getPhoneNumber().value())
                .status(customer.getStatus())
                .build();
    }

    private Customer toDomain(CustomerEntity entity) {
        return Customer.builder()
                .id(new CustomerId(entity.getId()))
                .username(entity.getUsername())
                .familyName(entity.getFamilyName())
                .givenName(entity.getGivenName())
                .email(new Email(entity.getEmail()))
                .phoneNumber(new PhoneNumber(entity.getPhoneNumber()))
                .status(entity.getStatus())
                .build();
    }
}