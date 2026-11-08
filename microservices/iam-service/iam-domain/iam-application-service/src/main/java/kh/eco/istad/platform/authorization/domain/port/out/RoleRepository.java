package kh.eco.istad.platform.authorization.domain.port.out;

import kh.eco.istad.platform.authorization.domain.dto.common.PageRequest;
import kh.eco.istad.platform.authorization.domain.dto.common.PageResult;
import kh.eco.istad.platform.authorization.domain.dto.role.command.RoleFilterQuery;
import kh.eco.istad.platform.authorization.domain.entity.assignment.RolePermission;
import kh.eco.istad.platform.authorization.domain.entity.role.Role;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RoleRepository {

    Optional<Role> findByUuid(UUID uuid);

    Optional<Role> findByName(String name);

    List<Role> findByUuids(Collection<UUID> uuids);

    boolean existsByName(String name);

    void save(Role role);

    PageResult<Role> findAll(RoleFilterQuery filter, PageRequest page);

    List<RolePermission> findRolePermissions(UUID roleUuid);

    /** The active link for this permission if one exists, otherwise a revoked one, or empty. */
    Optional<RolePermission> findRolePermission(UUID roleUuid, UUID permissionUuid);

    void saveRolePermission(RolePermission rolePermission);
}
