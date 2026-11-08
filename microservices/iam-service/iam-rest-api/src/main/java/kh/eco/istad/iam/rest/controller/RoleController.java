package kh.eco.istad.iam.rest.controller;

import jakarta.validation.Valid;
import kh.eco.istad.platform.authorization.domain.dto.role.command.AssignPermissionsToRoleCommand;
import kh.eco.istad.platform.authorization.domain.dto.common.PageRequest;
import kh.eco.istad.platform.authorization.domain.dto.role.command.RoleFilterQuery;
import kh.eco.istad.iam.rest.dto.Responses.RoleSummaryResponse;
import kh.eco.istad.platform.authorization.domain.usecase.role.ActivateRoleUseCase;
import kh.eco.istad.platform.authorization.domain.usecase.role.AssignPermissionsToRoleUseCase;
import kh.eco.istad.platform.authorization.domain.usecase.role.CreateRoleUseCase;
import kh.eco.istad.platform.authorization.domain.usecase.role.DeactivateRoleUseCase;
import kh.eco.istad.platform.authorization.domain.usecase.role.DeleteRoleUseCase;
import kh.eco.istad.platform.authorization.domain.usecase.role.GetRoleUseCase;
import kh.eco.istad.platform.authorization.domain.usecase.role.ListRolesUseCase;
import kh.eco.istad.platform.authorization.domain.usecase.role.RevokePermissionFromRoleUseCase;
import kh.eco.istad.platform.authorization.domain.usecase.role.UpdateRoleUseCase;
import kh.eco.istad.iam.rest.dto.Responses.PageResponse;
import kh.eco.istad.iam.rest.dto.Responses.PermissionAssignmentResponse;
import kh.eco.istad.iam.rest.dto.Responses.RoleResponse;
import kh.eco.istad.iam.rest.dto.RoleRequests.AssignPermissionsToRoleRequest;
import kh.eco.istad.iam.rest.dto.RoleRequests.CreateRoleRequest;
import kh.eco.istad.iam.rest.dto.RoleRequests.UpdateRoleRequest;
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

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/roles")
public class RoleController {

    private final CreateRoleUseCase createRole;
    private final ListRolesUseCase listRoles;
    private final GetRoleUseCase getRole;
    private final UpdateRoleUseCase updateRole;
    private final DeleteRoleUseCase deleteRole;
    private final ActivateRoleUseCase activateRole;
    private final DeactivateRoleUseCase deactivateRole;
    private final AssignPermissionsToRoleUseCase assignPermissions;
    private final RevokePermissionFromRoleUseCase revokePermission;

    public RoleController(CreateRoleUseCase createRole, ListRolesUseCase listRoles, GetRoleUseCase getRole,
                          UpdateRoleUseCase updateRole, DeleteRoleUseCase deleteRole,
                          ActivateRoleUseCase activateRole, DeactivateRoleUseCase deactivateRole,
                          AssignPermissionsToRoleUseCase assignPermissions,
                          RevokePermissionFromRoleUseCase revokePermission) {
        this.createRole = createRole;
        this.listRoles = listRoles;
        this.getRole = getRole;
        this.updateRole = updateRole;
        this.deleteRole = deleteRole;
        this.activateRole = activateRole;
        this.deactivateRole = deactivateRole;
        this.assignPermissions = assignPermissions;
        this.revokePermission = revokePermission;
    }

    @PostMapping
    @PreAuthorize("hasAuthority('role:create')")
    @ResponseStatus(HttpStatus.CREATED)
    public RoleResponse create(@Valid @RequestBody CreateRoleRequest request) {
        return RestMapper.toResponse(createRole.execute(RestMapper.toCommand(request)));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('role:read')")
    public PageResponse<RoleSummaryResponse> list(
            @RequestParam(name = "keyword", required = false) String keyword,
            @RequestParam(name = "active", required = false) Boolean active,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size,
            @RequestParam(name = "sort", required = false) String sort) {
        return RestMapper.toPage(
                listRoles.execute(new RoleFilterQuery(keyword, active), new PageRequest(page, size, sort)),
                RestMapper::toResponse);
    }

    @GetMapping("/{uuid}")
    @PreAuthorize("hasAuthority('role:read')")
    public RoleResponse get(@PathVariable("uuid") UUID uuid) {
        return RestMapper.toResponse(getRole.execute(uuid));
    }

    @PatchMapping("/{uuid}")
    @PreAuthorize("hasAuthority('role:update')")
    public RoleResponse update(@PathVariable("uuid") UUID uuid, @Valid @RequestBody UpdateRoleRequest request) {
        return RestMapper.toResponse(updateRole.execute(uuid, RestMapper.toCommand(request)));
    }

    @DeleteMapping("/{uuid}")
    @PreAuthorize("hasAuthority('role:delete')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable("uuid") UUID uuid) {
        deleteRole.execute(uuid);
    }

    @PostMapping("/{uuid}/activate")
    @PreAuthorize("hasAuthority('role:update')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void activate(@PathVariable("uuid") UUID uuid) {
        activateRole.execute(uuid);
    }

    @PostMapping("/{uuid}/deactivate")
    @PreAuthorize("hasAuthority('role:update')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deactivate(@PathVariable("uuid") UUID uuid) {
        deactivateRole.execute(uuid);
    }

    @PostMapping("/{uuid}/permissions")
    @PreAuthorize("hasAuthority('role:assign')")
    @ResponseStatus(HttpStatus.CREATED)
    public List<PermissionAssignmentResponse> assignPermissions(@PathVariable("uuid") UUID uuid,
                                                                @Valid @RequestBody AssignPermissionsToRoleRequest request) {
        return assignPermissions.execute(uuid, new AssignPermissionsToRoleCommand(
                        request.permissionUuids(), request.expiresAt(), request.reason()))
                .stream().map(RestMapper::toResponse).toList();
    }

    @DeleteMapping("/{uuid}/permissions/{permissionUuid}")
    @PreAuthorize("hasAuthority('role:assign')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void revokePermission(@PathVariable("uuid") UUID uuid, @PathVariable("permissionUuid") UUID permissionUuid,
                                 @RequestParam(name = "reason", required = false) String reason) {
        revokePermission.execute(uuid, permissionUuid, reason);
    }
}
