package kh.eco.istad.platform.customer.domain.port.out;

import kh.eco.istad.common.domain.valueobject.CustomerId;
import kh.eco.istad.platform.customer.domain.entity.Customer;

import java.util.List;
import java.util.Optional;

public interface CustomerRepository {

    Customer save(Customer customer);

    Optional<Customer> findById(CustomerId id);

    List<Customer> findAll();

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);
}