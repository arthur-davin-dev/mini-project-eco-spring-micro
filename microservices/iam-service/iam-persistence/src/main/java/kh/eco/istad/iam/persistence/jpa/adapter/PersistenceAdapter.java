package kh.eco.istad.iam.persistence.jpa.adapter;

import kh.eco.istad.platform.authorization.domain.dto.common.PageRequest;
import kh.eco.istad.platform.authorization.domain.dto.common.PageResult;
import kh.eco.istad.platform.authorization.domain.dto.permission.command.PermissionFilterQuery;
import kh.eco.istad.platform.authorization.domain.dto.role.command.RoleFilterQuery;
import kh.eco.istad.platform.authorization.domain.dto.user.command.UserFilterQuery;
import kh.eco.istad.platform.authorization.domain.port.out.PermissionRepository;
import kh.eco.istad.platform.authorization.domain.port.out.RoleRepository;
import kh.eco.istad.platform.authorization.domain.entity.assignment.RolePermission;
import kh.eco.istad.platform.authorization.domain.entity.assignment.UserPermission;
import kh.eco.istad.platform.authorization.domain.entity.assignment.UserRole;
import kh.eco.istad.platform.authorization.domain.entity.permission.Permission;
import kh.eco.istad.platform.authorization.domain.entity.role.Role;
import kh.eco.istad.platform.authorization.domain.entity.user.Identity;
import kh.eco.istad.platform.authorization.domain.entity.user.IdentityProvider;
import kh.eco.istad.platform.authorization.domain.entity.user.User;
import kh.eco.istad.platform.authorization.domain.exception.PhoneNumberConflictException;
import kh.eco.istad.iam.persistence.jpa.entity.IdentityEntity;
import kh.eco.istad.iam.persistence.jpa.entity.PermissionEntity;
import kh.eco.istad.iam.persistence.jpa.entity.RoleEntity;
import kh.eco.istad.iam.persistence.jpa.entity.RolePermissionEntity;
import kh.eco.istad.iam.persistence.jpa.entity.UserEntity;
import kh.eco.istad.iam.persistence.jpa.entity.UserPermissionEntity;
import kh.eco.istad.iam.persistence.jpa.entity.UserRoleEntity;
import kh.eco.istad.iam.persistence.jpa.repository.IdentityJpaRepository;
import kh.eco.istad.iam.persistence.jpa.repository.PermissionJpaRepository;
import kh.eco.istad.iam.persistence.jpa.repository.RoleJpaRepository;
import kh.eco.istad.iam.persistence.jpa.repository.RolePermissionJpaRepository;
import kh.eco.istad.iam.persistence.jpa.repository.UserJpaRepository;
import kh.eco.istad.iam.persistence.jpa.repository.UserPermissionJpaRepository;
import kh.eco.istad.iam.persistence.jpa.repository.UserRoleJpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
@Transactional(readOnly = true)
public class PersistenceAdapter {

    private final UserJpaRepository users;
    private final RoleJpaRepository roles;
    private final PermissionJpaRepository permissions;
    private final IdentityJpaRepository identities;
    private final UserRoleJpaRepository userRoles;
    private final RolePermissionJpaRepository rolePermissions;
    private final UserPermissionJpaRepository userPermissions;

    public PersistenceAdapter(UserJpaRepository users, RoleJpaRepository roles,
                                 PermissionJpaRepository permissions, IdentityJpaRepository identities,
                                 UserRoleJpaRepository userRoles,
                                 RolePermissionJpaRepository rolePermissions,
                                 UserPermissionJpaRepository userPermissions) {
        this.users = users;
        this.roles = roles;
        this.permissions = permissions;
        this.identities = identities;
        this.userRoles = userRoles;
        this.rolePermissions = rolePermissions;
        this.userPermissions = userPermissions;
    }

    public Optional<User> findByUuid(UUID uuid) {
        return users.findByUuidAndDeletedFalse(uuid).map(this::toDomain);
    }

    public Optional<User> findByUsernameOrEmail(String usernameOrEmail) {
        return users.findByUsernameIgnoreCaseAndDeletedFalseOrEmailIgnoreCaseAndDeletedFalse(
                usernameOrEmail, usernameOrEmail).map(this::toDomain);
    }

    public Optional<User> findByIdentity(IdentityProvider provider, String providerSubject) {
        return identities.findByProviderAndProviderSubjectAndDeletedFalse(provider.name(), providerSubject)
                .flatMap(identity -> users.findById(identity.getUserId()))
                .filter(user -> !user.isDeleted())
                .map(this::toDomain);
    }

    public boolean existsByUsername(String username) {
        return users.existsByUsernameIgnoreCaseAndDeletedFalse(username);
    }

    public boolean existsByEmail(String email) {
        return users.existsByEmailIgnoreCaseAndDeletedFalse(email);
    }

    public boolean existsByPhoneNumber(String phoneNumber) {
        return users.existsByPhoneNumber(phoneNumber);
    }

    public boolean existsByPhoneNumberForAnotherUser(String phoneNumber, UUID userUuid) {
        return users.existsByPhoneNumberAndUuidNot(phoneNumber, userUuid);
    }

    @Transactional
    public void save(User user) {
        UserEntity entity = users.findByUuidAndDeletedFalse(user.getUuid()).orElseGet(UserEntity::new);
        if (entity.getId() != null && entity.getVersion() != user.getVersion()) {
            throw stale("user", user.getUuid());
        }
        DomainMapper.copyTo(user, entity);
        try {
            entity = users.saveAndFlush(entity);
        } catch (DataIntegrityViolationException exception) {
            if (hasCauseMessage(exception, "iam_users_phone_number_key")) {
                throw new PhoneNumberConflictException();
            }
            throw exception;
        }
        user.synchronizeVersion(entity.getVersion());
        for (Identity identity : user.getIdentities()) {
            IdentityEntity identityEntity = identities.findByUuid(identity.getUuid())
                    .orElseGet(IdentityEntity::new);
            if (identityEntity.getId() != null && identityEntity.getVersion() != identity.getVersion()) {
                throw stale("identity", identity.getUuid());
            }
            DomainMapper.copyTo(identity, identityEntity, entity.getId());
            identityEntity = identities.saveAndFlush(identityEntity);
            identity.synchronizeVersion(identityEntity.getVersion());
        }
    }

    private static boolean hasCauseMessage(Throwable exception, String text) {
        for (Throwable cause = exception; cause != null; cause = cause.getCause()) {
            if (cause.getMessage() != null && cause.getMessage().contains(text)) {
                return true;
            }
        }
        return false;
    }

    public PageResult<User> findAll(UserFilterQuery filter, PageRequest page) {
        Specification<UserEntity> spec = (root, query, cb) -> cb.isFalse(root.get("deleted"));
        if (filter != null && filter.keyword() != null && !filter.keyword().isBlank()) {
            String keyword = contains(filter.keyword());
            spec = spec.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("username")), keyword),
                    cb.like(cb.lower(root.get("email")), keyword),
                    cb.like(cb.lower(root.get("givenName")), keyword),
                    cb.like(cb.lower(root.get("familyName")), keyword)));
        }
        if (filter != null && filter.enabled() != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("enabled"), filter.enabled()));
        }
        if (filter != null && filter.locked() != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("accountNonLocked"), !filter.locked()));
        }
        Page<UserEntity> found = users.findAll(spec, pageable(page, "createdAt",
                List.of("username", "email", "createdAt", "updatedAt")));
        return mapPage(found, this::toDomain);
    }

    public List<UserRole> findUserRoles(UUID userUuid) {
        UserEntity user = userEntity(userUuid);
        return userRoles.findByUserId(user.getId()).stream()
                .map(link -> roles.findById(link.getRoleId())
                        .map(role -> DomainMapper.toDomain(link, userUuid, role.getUuid())).orElse(null))
                .filter(java.util.Objects::nonNull).toList();
    }

    public Optional<UserRole> findUserRole(UUID userUuid, UUID roleUuid) {
        UserEntity user = userEntity(userUuid);
        RoleEntity role = roleEntity(roleUuid);
        return userRoles.findFirstByUserIdAndRoleIdOrderByIdDesc(user.getId(), role.getId())
                .map(link -> DomainMapper.toDomain(link, userUuid, roleUuid));
    }

    @Transactional
    public void saveUserRole(UserRole link) {
        UserEntity user = userEntity(link.getUserUuid());
        RoleEntity role = roleEntity(link.getRoleUuid());
        UserRoleEntity entity = userRoles.findFirstByUserIdAndRoleIdOrderByIdDesc(user.getId(), role.getId())
                .filter(row -> row.getAssignedAt().equals(link.getAssignedAt()))
                .orElseGet(UserRoleEntity::new);
        entity.setUserId(user.getId());
        entity.setRoleId(role.getId());
        entity.setAssignedAt(link.getAssignedAt());
        entity.setAssignedBy(link.getAssignedBy());
        entity.setExpiresAt(link.getExpiresAt());
        entity.setRevokedAt(link.getRevokedAt());
        entity.setRevokedBy(link.getRevokedBy());
        entity.setReason(link.getReason());
        userRoles.save(entity);
    }

    public List<UserPermission> findUserPermissions(UUID userUuid) {
        UserEntity user = userEntity(userUuid);
        return userPermissions.findByUserId(user.getId()).stream()
                .map(link -> permissions.findById(link.getPermissionId())
                        .map(permission -> DomainMapper.toDomain(link, userUuid, permission.getUuid())).orElse(null))
                .filter(java.util.Objects::nonNull).toList();
    }

    public Optional<UserPermission> findUserPermission(UUID userUuid, UUID permissionUuid) {
        UserEntity user = userEntity(userUuid);
        PermissionEntity permission = permissionEntity(permissionUuid);
        return userPermissions.findFirstByUserIdAndPermissionIdOrderByIdDesc(user.getId(), permission.getId())
                .map(link -> DomainMapper.toDomain(link, userUuid, permissionUuid));
    }

    @Transactional
    public void saveUserPermission(UserPermission link) {
        UserEntity user = userEntity(link.getUserUuid());
        PermissionEntity permission = permissionEntity(link.getPermissionUuid());
        UserPermissionEntity entity = userPermissions
                .findFirstByUserIdAndPermissionIdOrderByIdDesc(user.getId(), permission.getId())
                .filter(row -> row.getAssignedAt().equals(link.getAssignedAt()))
                .orElseGet(UserPermissionEntity::new);
        entity.setUserId(user.getId());
        entity.setPermissionId(permission.getId());
        entity.setEffect(link.getEffect().name());
        entity.setAssignedAt(link.getAssignedAt());
        entity.setAssignedBy(link.getAssignedBy());
        entity.setExpiresAt(link.getExpiresAt());
        entity.setRevokedAt(link.getRevokedAt());
        entity.setRevokedBy(link.getRevokedBy());
        entity.setReason(link.getReason());
        userPermissions.save(entity);
    }

    public Optional<Role> findRoleByUuid(UUID uuid) {
        return roles.findByUuidAndDeletedFalse(uuid).map(DomainMapper::toDomain);
    }

    public Optional<Role> findByName(String name) {
        return roles.findByNameIgnoreCaseAndDeletedFalse(name).map(DomainMapper::toDomain);
    }

    public List<Role> findRolesByUuids(Collection<UUID> uuids) {
        return roles.findByUuidInAndDeletedFalse(uuids).stream().map(DomainMapper::toDomain).toList();
    }

    public boolean existsByName(String name) {
        return roles.existsByNameIgnoreCaseAndDeletedFalse(name);
    }

    @Transactional
    public void save(Role role) {
        RoleEntity entity = roles.findByUuidAndDeletedFalse(role.getUuid()).orElseGet(RoleEntity::new);
        if (entity.getId() != null && entity.getVersion() != role.getVersion()) {
            throw stale("role", role.getUuid());
        }
        DomainMapper.copyTo(role, entity);
        entity = roles.saveAndFlush(entity);
        role.synchronizeVersion(entity.getVersion());
    }

    public PageResult<Role> findAll(RoleFilterQuery filter, PageRequest page) {
        Specification<RoleEntity> spec = (root, query, cb) -> cb.isFalse(root.get("deleted"));
        if (filter != null && filter.keyword() != null && !filter.keyword().isBlank()) {
            String keyword = contains(filter.keyword());
            spec = spec.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("name")), keyword),
                    cb.like(cb.lower(root.get("description")), keyword)));
        }
        if (filter != null && filter.active() != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("active"), filter.active()));
        }
        Page<RoleEntity> found = roles.findAll(spec, pageable(page, "name", List.of("name", "createdAt", "updatedAt")));
        return mapPage(found, DomainMapper::toDomain);
    }

    public List<RolePermission> findRolePermissions(UUID roleUuid) {
        RoleEntity role = roleEntity(roleUuid);
        return rolePermissions.findByRoleId(role.getId()).stream()
                .map(link -> permissions.findById(link.getPermissionId())
                        .map(permission -> DomainMapper.toDomain(link, roleUuid, permission.getUuid())).orElse(null))
                .filter(java.util.Objects::nonNull).toList();
    }

    public Optional<RolePermission> findRolePermission(UUID roleUuid, UUID permissionUuid) {
        RoleEntity role = roleEntity(roleUuid);
        PermissionEntity permission = permissionEntity(permissionUuid);
        return rolePermissions.findFirstByRoleIdAndPermissionIdOrderByIdDesc(role.getId(), permission.getId())
                .map(link -> DomainMapper.toDomain(link, roleUuid, permissionUuid));
    }

    @Transactional
    public void saveRolePermission(RolePermission link) {
        RoleEntity role = roleEntity(link.getRoleUuid());
        PermissionEntity permission = permissionEntity(link.getPermissionUuid());
        RolePermissionEntity entity = rolePermissions
                .findFirstByRoleIdAndPermissionIdOrderByIdDesc(role.getId(), permission.getId())
                .filter(row -> row.getAssignedAt().equals(link.getAssignedAt()))
                .orElseGet(RolePermissionEntity::new);
        entity.setRoleId(role.getId());
        entity.setPermissionId(permission.getId());
        entity.setAssignedAt(link.getAssignedAt());
        entity.setAssignedBy(link.getAssignedBy());
        entity.setExpiresAt(link.getExpiresAt());
        entity.setRevokedAt(link.getRevokedAt());
        entity.setRevokedBy(link.getRevokedBy());
        entity.setReason(link.getReason());
        rolePermissions.save(entity);
    }

    public Optional<Permission> findPermissionByUuid(UUID uuid) {
        return permissions.findByUuidAndDeletedFalse(uuid).map(DomainMapper::toDomain);
    }

    public Optional<Permission> findByResourceAndAction(String resource, String action) {
        return permissions.findByResourceIgnoreCaseAndActionIgnoreCaseAndDeletedFalse(resource, action)
                .map(DomainMapper::toDomain);
    }

    public List<Permission> findPermissionsByUuids(Collection<UUID> uuids) {
        return permissions.findByUuidInAndDeletedFalse(uuids).stream().map(DomainMapper::toDomain).toList();
    }

    public boolean existsByResourceAndAction(String resource, String action) {
        return permissions.existsByResourceIgnoreCaseAndActionIgnoreCaseAndDeletedFalse(resource, action);
    }

    @Transactional
    public void save(Permission permission) {
        PermissionEntity entity = permissions.findByUuidAndDeletedFalse(permission.getUuid())
                .orElseGet(PermissionEntity::new);
        if (entity.getId() != null && entity.getVersion() != permission.getVersion()) {
            throw stale("permission", permission.getUuid());
        }
        DomainMapper.copyTo(permission, entity);
        entity = permissions.saveAndFlush(entity);
        permission.synchronizeVersion(entity.getVersion());
    }

    public PageResult<Permission> findAll(PermissionFilterQuery filter, PageRequest page) {
        Specification<PermissionEntity> spec = (root, query, cb) -> cb.isFalse(root.get("deleted"));
        if (filter != null && filter.resource() != null && !filter.resource().isBlank()) {
            spec = spec.and((root, query, cb) -> cb.equal(cb.lower(root.get("resource")),
                    filter.resource().toLowerCase(java.util.Locale.ROOT)));
        }
        if (filter != null && filter.action() != null && !filter.action().isBlank()) {
            spec = spec.and((root, query, cb) -> cb.equal(cb.lower(root.get("action")),
                    filter.action().toLowerCase(java.util.Locale.ROOT)));
        }
        if (filter != null && filter.active() != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("active"), filter.active()));
        }
        Page<PermissionEntity> found = permissions.findAll(spec, pageable(page, "resource",
                List.of("name", "resource", "action", "createdAt", "updatedAt")));
        return mapPage(found, DomainMapper::toDomain);
    }

    private User toDomain(UserEntity entity) {
        List<Identity> linked = identities.findByUserIdOrderById(entity.getId()).stream()
                .map(DomainMapper::toDomain).toList();
        return DomainMapper.toDomain(entity, linked);
    }

    private UserEntity userEntity(UUID uuid) {
        return users.findByUuidAndDeletedFalse(uuid)
                .orElseThrow(() -> new IllegalStateException("IAM user not found: " + uuid));
    }

    private RoleEntity roleEntity(UUID uuid) {
        return roles.findByUuidAndDeletedFalse(uuid)
                .orElseThrow(() -> new IllegalStateException("IAM role not found: " + uuid));
    }

    private PermissionEntity permissionEntity(UUID uuid) {
        return permissions.findByUuidAndDeletedFalse(uuid)
                .orElseThrow(() -> new IllegalStateException("IAM permission not found: " + uuid));
    }

    private static OptimisticLockingFailureException stale(String aggregate, UUID uuid) {
        return new OptimisticLockingFailureException(
                "Stale " + aggregate + " version for " + uuid + "; reload before applying changes");
    }

    private static String contains(String text) {
        return "%" + text.trim().toLowerCase(java.util.Locale.ROOT).replace("\\", "\\\\")
                .replace("%", "\\%").replace("_", "\\_") + "%";
    }

    private static Pageable pageable(PageRequest request, String defaultSort, List<String> allowed) {
        String property = defaultSort;
        Sort.Direction direction = Sort.Direction.ASC;
        if (request.sort() != null && !request.sort().isBlank()) {
            String[] parts = request.sort().split(",", 2);
            if (allowed.contains(parts[0])) property = parts[0];
            if (parts.length == 2 && parts[1].equalsIgnoreCase("desc")) direction = Sort.Direction.DESC;
        }
        return org.springframework.data.domain.PageRequest.of(request.page(), request.size(), Sort.by(direction, property));
    }

    private static <E, D> PageResult<D> mapPage(Page<E> page, java.util.function.Function<E, D> mapper) {
        return new PageResult<>(page.getContent().stream().map(mapper).toList(), page.getNumber(),
                page.getSize(), page.getTotalElements(), page.getTotalPages());
    }
}
