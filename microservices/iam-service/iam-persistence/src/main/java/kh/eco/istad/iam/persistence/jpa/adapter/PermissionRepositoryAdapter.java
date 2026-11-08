package kh.eco.istad.iam.persistence.jpa.adapter;

import kh.eco.istad.platform.authorization.domain.dto.common.PageRequest;
import kh.eco.istad.platform.authorization.domain.dto.common.PageResult;
import kh.eco.istad.platform.authorization.domain.dto.permission.command.PermissionFilterQuery;
import kh.eco.istad.platform.authorization.domain.port.out.PermissionRepository;
import kh.eco.istad.platform.authorization.domain.entity.permission.Permission;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public class PermissionRepositoryAdapter implements PermissionRepository {
    private final PersistenceAdapter persistence;

    public PermissionRepositoryAdapter(PersistenceAdapter persistence) {
        this.persistence = persistence;
    }

    @Override
    public Optional<Permission> findByUuid(UUID uuid) {
        return persistence.findPermissionByUuid(uuid);
    }

    @Override
    public Optional<Permission> findByResourceAndAction(String resource, String action) {
        return persistence.findByResourceAndAction(resource, action);
    }

    @Override
    public List<Permission> findByUuids(Collection<UUID> uuids) {
        return persistence.findPermissionsByUuids(uuids);
    }

    @Override
    public boolean existsByResourceAndAction(String resource, String action) {
        return persistence.existsByResourceAndAction(resource, action);
    }

    @Override
    public void save(Permission permission) {
        persistence.save(permission);
    }

    @Override
    public PageResult<Permission> findAll(PermissionFilterQuery filter, PageRequest page) {
        return persistence.findAll(filter, page);
    }
}
