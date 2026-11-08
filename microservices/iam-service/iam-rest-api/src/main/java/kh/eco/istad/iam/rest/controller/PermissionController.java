package kh.eco.istad.iam.rest.controller;

import jakarta.validation.Valid;
import kh.eco.istad.platform.authorization.domain.dto.common.PageRequest;
import kh.eco.istad.platform.authorization.domain.dto.permission.command.PermissionFilterQuery;
import kh.eco.istad.platform.authorization.domain.usecase.permission.ActivatePermissionUseCase;
import kh.eco.istad.platform.authorization.domain.usecase.permission.CreatePermissionUseCase;
import kh.eco.istad.platform.authorization.domain.usecase.permission.DeactivatePermissionUseCase;
import kh.eco.istad.platform.authorization.domain.usecase.permission.DeletePermissionUseCase;
import kh.eco.istad.platform.authorization.domain.usecase.permission.GetPermissionUseCase;
import kh.eco.istad.platform.authorization.domain.usecase.permission.ListPermissionsUseCase;
import kh.eco.istad.platform.authorization.domain.usecase.permission.UpdatePermissionUseCase;
import kh.eco.istad.iam.rest.dto.PermissionRequests.CreatePermissionRequest;
import kh.eco.istad.iam.rest.dto.PermissionRequests.UpdatePermissionRequest;
import kh.eco.istad.iam.rest.dto.Responses.PageResponse;
import kh.eco.istad.iam.rest.dto.Responses.PermissionResponse;
import kh.eco.istad.iam.rest.mapper.RestMapper;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/permissions")
public class PermissionController {

    private final CreatePermissionUseCase createPermission;
    private final ListPermissionsUseCase listPermissions;
    private final GetPermissionUseCase getPermission;
    private final UpdatePermissionUseCase updatePermission;
    private final DeletePermissionUseCase deletePermission;
    private final ActivatePermissionUseCase activatePermission;
    private final DeactivatePermissionUseCase deactivatePermission;

    public PermissionController(CreatePermissionUseCase createPermission, ListPermissionsUseCase listPermissions,
                                GetPermissionUseCase getPermission, UpdatePermissionUseCase updatePermission,
                                DeletePermissionUseCase deletePermission,
                                ActivatePermissionUseCase activatePermission,
                                DeactivatePermissionUseCase deactivatePermission) {
        this.createPermission = createPermission;
        this.listPermissions = listPermissions;
        this.getPermission = getPermission;
        this.updatePermission = updatePermission;
        this.deletePermission = deletePermission;
        this.activatePermission = activatePermission;
        this.deactivatePermission = deactivatePermission;
    }

    @PostMapping
    @PreAuthorize("hasAuthority('permission:create')")
    @ResponseStatus(HttpStatus.CREATED)
    public PermissionResponse create(@Valid @RequestBody CreatePermissionRequest request) {
        return RestMapper.toResponse(createPermission.execute(RestMapper.toCommand(request)));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('permission:read')")
    public PageResponse<PermissionResponse> list(
            @RequestParam(name = "resource", required = false) String resource,
            @RequestParam(name = "action", required = false) String action,
            @RequestParam(name = "active", required = false) Boolean active,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size,
            @RequestParam(name = "sort", required = false) String sort) {
        return RestMapper.toPage(
                listPermissions.execute(new PermissionFilterQuery(resource, action, active),
                        new PageRequest(page, size, sort)),
                RestMapper::toResponse);
    }

    @GetMapping("/{uuid}")
    @PreAuthorize("hasAuthority('permission:read')")
    public PermissionResponse get(@PathVariable("uuid") UUID uuid) {
        return RestMapper.toResponse(getPermission.execute(uuid));
    }

    @PatchMapping("/{uuid}")
    @PreAuthorize("hasAuthority('permission:update')")
    public PermissionResponse update(@PathVariable("uuid") UUID uuid, @Valid @RequestBody UpdatePermissionRequest request) {
        return RestMapper.toResponse(updatePermission.execute(uuid, RestMapper.toCommand(request)));
    }

    @DeleteMapping("/{uuid}")
    @PreAuthorize("hasAuthority('permission:delete')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable("uuid") UUID uuid) {
        deletePermission.execute(uuid);
    }

    @PostMapping("/{uuid}/activate")
    @PreAuthorize("hasAuthority('permission:update')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void activate(@PathVariable("uuid") UUID uuid) {
        activatePermission.execute(uuid);
    }

    @PostMapping("/{uuid}/deactivate")
    @PreAuthorize("hasAuthority('permission:update')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deactivate(@PathVariable("uuid") UUID uuid) {
        deactivatePermission.execute(uuid);
    }
}
