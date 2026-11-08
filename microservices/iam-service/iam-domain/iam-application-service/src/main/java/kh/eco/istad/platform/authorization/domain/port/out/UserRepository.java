package kh.eco.istad.platform.authorization.domain.port.out;

import kh.eco.istad.platform.authorization.domain.dto.common.PageRequest;
import kh.eco.istad.platform.authorization.domain.dto.common.PageResult;
import kh.eco.istad.platform.authorization.domain.dto.user.command.UserFilterQuery;
import kh.eco.istad.platform.authorization.domain.entity.assignment.UserPermission;
import kh.eco.istad.platform.authorization.domain.entity.assignment.UserRole;
import kh.eco.istad.platform.authorization.domain.entity.user.IdentityProvider;
import kh.eco.istad.platform.authorization.domain.entity.user.User;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository {

    Optional<User> findByUuid(UUID uuid);

    Optional<User> findByUsernameOrEmail(String usernameOrEmail);

    Optional<User> findByIdentity(IdentityProvider provider, String providerSubject);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    boolean existsByPhoneNumber(String phoneNumber);

    boolean existsByPhoneNumberForAnotherUser(String phoneNumber, UUID userUuid);

    void save(User user);

    PageResult<User> findAll(UserFilterQuery filter, PageRequest page);

    List<UserRole> findUserRoles(UUID userUuid);

    Optional<UserRole> findUserRole(UUID userUuid, UUID roleUuid);

    void saveUserRole(UserRole userRole);

    List<UserPermission> findUserPermissions(UUID userUuid);

    Optional<UserPermission> findUserPermission(UUID userUuid, UUID permissionUuid);

    void saveUserPermission(UserPermission userPermission);
}
