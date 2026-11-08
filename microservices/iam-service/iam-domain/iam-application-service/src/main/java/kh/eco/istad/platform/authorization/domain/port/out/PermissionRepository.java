package kh.eco.istad.platform.authorization.domain.port.out;

import kh.eco.istad.platform.authorization.domain.dto.common.PageRequest;
import kh.eco.istad.platform.authorization.domain.dto.common.PageResult;
import kh.eco.istad.platform.authorization.domain.dto.permission.command.PermissionFilterQuery;
import kh.eco.istad.platform.authorization.domain.entity.permission.Permission;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PermissionRepository {

    Optional<Permission> findByUuid(UUID uuid);

    Optional<Permission> findByResourceAndAction(String resource, String action);

    List<Permission> findByUuids(Collection<UUID> uuids);

    boolean existsByResourceAndAction(String resource, String action);

    void save(Permission permission);

    PageResult<Permission> findAll(PermissionFilterQuery filter, PageRequest page);
}
