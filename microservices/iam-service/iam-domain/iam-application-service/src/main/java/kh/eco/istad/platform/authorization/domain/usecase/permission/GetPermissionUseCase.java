package kh.eco.istad.platform.authorization.domain.usecase.permission;

import kh.eco.istad.platform.authorization.domain.dto.permission.result.PermissionResult;
import kh.eco.istad.platform.authorization.domain.port.out.PermissionRepository;
import kh.eco.istad.platform.authorization.domain.usecase.shared.Rules;

import java.util.UUID;
import kh.eco.istad.platform.authorization.domain.mapper.DomainDtoMapper;

public class GetPermissionUseCase {

    private final PermissionRepository permissions;

    public GetPermissionUseCase(PermissionRepository permissions) {
        this.permissions = permissions;
    }

    public PermissionResult execute(UUID permissionUuid) {
        return DomainDtoMapper.toPermissionResult(Rules.loadPermission(permissions, permissionUuid));
    }
}
