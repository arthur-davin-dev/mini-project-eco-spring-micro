package kh.eco.istad.platform.order.domain.port.out;

import kh.eco.istad.common.domain.valueobject.CustomerId;
import kh.eco.istad.platform.order.domain.entity.Customer;

import java.util.Optional;

public interface CustomerRepository {

    Optional<Customer> findCustomer (CustomerId customerId);

}
