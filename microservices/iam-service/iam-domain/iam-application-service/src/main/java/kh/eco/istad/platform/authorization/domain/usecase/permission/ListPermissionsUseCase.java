package kh.eco.istad.platform.authorization.domain.usecase.permission;

import kh.eco.istad.platform.authorization.domain.dto.common.PageRequest;
import kh.eco.istad.platform.authorization.domain.dto.common.PageResult;
import kh.eco.istad.platform.authorization.domain.dto.permission.command.PermissionFilterQuery;
import kh.eco.istad.platform.authorization.domain.dto.permission.result.PermissionResult;
import kh.eco.istad.platform.authorization.domain.mapper.DomainDtoMapper;
import kh.eco.istad.platform.authorization.domain.port.out.PermissionRepository;

public class ListPermissionsUseCase {

    private final PermissionRepository permissions;

    public ListPermissionsUseCase(PermissionRepository permissions) {
        this.permissions = permissions;
    }

    public PageResult<PermissionResult> execute(PermissionFilterQuery filter, PageRequest page) {
        var found = permissions.findAll(filter, page);
        var content = found.content().stream().map(DomainDtoMapper::toPermissionResult).toList();
        return new PageResult<>(content, found.page(), found.size(), found.totalElements(), found.totalPages());
    }
}
