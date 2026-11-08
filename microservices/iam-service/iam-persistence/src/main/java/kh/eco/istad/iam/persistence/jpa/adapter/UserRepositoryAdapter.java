package kh.eco.istad.iam.persistence.jpa.adapter;

import kh.eco.istad.platform.authorization.domain.dto.common.PageRequest;
import kh.eco.istad.platform.authorization.domain.dto.common.PageResult;
import kh.eco.istad.platform.authorization.domain.dto.user.command.UserFilterQuery;
import kh.eco.istad.platform.authorization.domain.port.out.UserRepository;
import kh.eco.istad.platform.authorization.domain.entity.assignment.UserPermission;
import kh.eco.istad.platform.authorization.domain.entity.assignment.UserRole;
import kh.eco.istad.platform.authorization.domain.entity.user.IdentityProvider;
import kh.eco.istad.platform.authorization.domain.entity.user.User;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public class UserRepositoryAdapter implements UserRepository {
    private final PersistenceAdapter persistence;

    public UserRepositoryAdapter(PersistenceAdapter persistence) {
        this.persistence = persistence;
    }

    @Override
    public Optional<User> findByUuid(UUID uuid) {
        return persistence.findByUuid(uuid);
    }

    @Override
    public Optional<User> findByUsernameOrEmail(String usernameOrEmail) {
        return persistence.findByUsernameOrEmail(usernameOrEmail);
    }

    @Override
    public Optional<User> findByIdentity(IdentityProvider provider, String providerSubject) {
        return persistence.findByIdentity(provider, providerSubject);
    }

    @Override
    public boolean existsByUsername(String username) {
        return persistence.existsByUsername(username);
    }

    @Override
    public boolean existsByEmail(String email) {
        return persistence.existsByEmail(email);
    }

    @Override
    public boolean existsByPhoneNumber(String phoneNumber) {
        return persistence.existsByPhoneNumber(phoneNumber);
    }

    @Override
    public boolean existsByPhoneNumberForAnotherUser(String phoneNumber, UUID userUuid) {
        return persistence.existsByPhoneNumberForAnotherUser(phoneNumber, userUuid);
    }

    @Override
    public void save(User user) {
        persistence.save(user);
    }

    @Override
    public PageResult<User> findAll(UserFilterQuery filter, PageRequest page) {
        return persistence.findAll(filter, page);
    }

    @Override
    public List<UserRole> findUserRoles(UUID userUuid) {
        return persistence.findUserRoles(userUuid);
    }

    @Override
    public Optional<UserRole> findUserRole(UUID userUuid, UUID roleUuid) {
        return persistence.findUserRole(userUuid, roleUuid);
    }

    @Override
    public void saveUserRole(UserRole userRole) {
        persistence.saveUserRole(userRole);
    }

    @Override
    public List<UserPermission> findUserPermissions(UUID userUuid) {
        return persistence.findUserPermissions(userUuid);
    }

    @Override
    public Optional<UserPermission> findUserPermission(UUID userUuid, UUID permissionUuid) {
        return persistence.findUserPermission(userUuid, permissionUuid);
    }

    @Override
    public void saveUserPermission(UserPermission userPermission) {
        persistence.saveUserPermission(userPermission);
    }
}
