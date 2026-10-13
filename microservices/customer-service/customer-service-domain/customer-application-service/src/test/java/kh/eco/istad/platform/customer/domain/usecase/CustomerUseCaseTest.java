package kh.eco.istad.platform.customer.domain.usecase;

import kh.eco.istad.common.domain.exception.ResourceNotFoundException;
import kh.eco.istad.common.domain.valueobject.CustomerId;
import kh.eco.istad.platform.customer.domain.dto.CustomerResult;
import kh.eco.istad.platform.customer.domain.dto.InitiateCustomerCommand;
import kh.eco.istad.platform.customer.domain.dto.UpdateCustomerCommand;
import kh.eco.istad.platform.customer.domain.entity.Customer;
import kh.eco.istad.platform.customer.domain.exception.CustomerAlreadyExistsException;
import kh.eco.istad.platform.customer.domain.exception.CustomerDomainException;
import kh.eco.istad.platform.customer.domain.mapper.CustomerDataMapper;
import kh.eco.istad.platform.customer.domain.port.out.CustomerRepository;
import kh.eco.istad.platform.customer.domain.service.CustomerDomainServiceImpl;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

class CustomerUseCaseTest {

    private static class InMemoryCustomerRepository implements CustomerRepository {
        private final Map<UUID, Customer> store = new HashMap<>();

        @Override
        public Customer save(Customer customer) {
            store.put(customer.getId().value(), customer);
            return customer;
        }

        @Override
        public Optional<Customer> findById(CustomerId id) {
            return Optional.ofNullable(store.get(id.value()));
        }

        @Override
        public List<Customer> findAll() {
            return new ArrayList<>(store.values());
        }

        @Override
        public boolean existsByUsername(String username) {
            return store.values().stream().anyMatch(c -> c.getUsername().equals(username));
        }

        @Override
        public boolean existsByEmail(String email) {
            return store.values().stream().anyMatch(c -> c.getEmail().value().equals(email));
        }
    }

    private final InMemoryCustomerRepository repository = new InMemoryCustomerRepository();
    private final CustomerDataMapper mapper = new CustomerDataMapper();
    private final CustomerDomainServiceImpl domainService = new CustomerDomainServiceImpl();

    private final InitiateCustomerUseCase initiate = new InitiateCustomerUseCase(domainService, repository, mapper);
    private final UpdateCustomerUseCase update = new UpdateCustomerUseCase(domainService, repository, mapper);
    private final DeactivateCustomerUseCase deactivate = new DeactivateCustomerUseCase(domainService, repository, mapper);
    private final GetCustomerUseCase getOne = new GetCustomerUseCase(repository, mapper);

    private InitiateCustomerCommand command(String username, String email) {
        return new InitiateCustomerCommand(username, "Chhay", "Davin", email, "+85512345678");
    }

    @Test
    void createsActiveCustomer() {
        CustomerResult result = initiate.execute(command("davin", "davin@gmail.com"));

        assertNotNull(result.customerId());
        assertEquals("ACTIVE", result.status());
    }

    @Test
    void duplicateUsernameIsRejected() {
        initiate.execute(command("davin", "davin@gmail.com"));

        assertThrows(CustomerAlreadyExistsException.class,
                () -> initiate.execute(command("davin", "other@gmail.com")));
    }

    @Test
    void duplicateEmailIsRejected() {
        initiate.execute(command("davin", "davin@gmail.com"));

        assertThrows(CustomerAlreadyExistsException.class,
                () -> initiate.execute(command("other", "davin@gmail.com")));
    }

    @Test
    void invalidEmailIsRejected() {
        assertThrows(CustomerDomainException.class, () -> initiate.execute(command("davin", "abc")));
    }

    @Test
    void unknownCustomerIsNotFound() {
        assertThrows(ResourceNotFoundException.class, () -> getOne.execute(UUID.randomUUID()));
    }

    @Test
    void updateAndDeactivateWork() {
        CustomerResult created = initiate.execute(command("davin", "davin@gmail.com"));

        CustomerResult updated = update.execute(new UpdateCustomerCommand(
                created.customerId(), "Chhay", "Updated", "davin@gmail.com", "+85598765432"));
        assertEquals("Updated", updated.givenName());

        CustomerResult deactivated = deactivate.execute(created.customerId());
        assertEquals("INACTIVE", deactivated.status());
    }
}