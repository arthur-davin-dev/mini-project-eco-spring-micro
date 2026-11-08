package kh.eco.istad.iam.persistence.jpa.adapter;

import kh.eco.istad.platform.authorization.domain.dto.common.PageRequest;
import kh.eco.istad.platform.authorization.domain.dto.common.PageResult;
import kh.eco.istad.platform.authorization.domain.dto.role.command.RoleFilterQuery;
import kh.eco.istad.platform.authorization.domain.port.out.RoleRepository;
import kh.eco.istad.platform.authorization.domain.entity.assignment.RolePermission;
import kh.eco.istad.platform.authorization.domain.entity.role.Role;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public class RoleRepositoryAdapter implements RoleRepository {
    private final PersistenceAdapter persistence;

    public RoleRepositoryAdapter(PersistenceAdapter persistence) {
        this.persistence = persistence;
    }

    @Override
    public Optional<Role> findByUuid(UUID uuid) {
        return persistence.findRoleByUuid(uuid);
    }

    @Override
    public Optional<Role> findByName(String name) {
        return persistence.findByName(name);
    }

    @Override
    public List<Role> findByUuids(Collection<UUID> uuids) {
        return persistence.findRolesByUuids(uuids);
    }

    @Override
    public boolean existsByName(String name) {
        return persistence.existsByName(name);
    }

    @Override
    public void save(Role role) {
        persistence.save(role);
    }

    @Override
    public PageResult<Role> findAll(RoleFilterQuery filter, PageRequest page) {
        return persistence.findAll(filter, page);
    }

    @Override
    public List<RolePermission> findRolePermissions(UUID roleUuid) {
        return persistence.findRolePermissions(roleUuid);
    }

    @Override
    public Optional<RolePermission> findRolePermission(UUID roleUuid, UUID permissionUuid) {
        return persistence.findRolePermission(roleUuid, permissionUuid);
    }

    @Override
    public void saveRolePermission(RolePermission rolePermission) {
        persistence.saveRolePermission(rolePermission);
    }
}
