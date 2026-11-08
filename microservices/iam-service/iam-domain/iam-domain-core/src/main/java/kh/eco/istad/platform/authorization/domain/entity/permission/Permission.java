package kh.eco.istad.platform.authorization.domain.entity.permission;

import kh.eco.istad.platform.authorization.domain.entity.AuditableEntity;
import kh.eco.istad.platform.authorization.domain.exception.DomainException;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;
import java.util.regex.Pattern;

public class Permission extends AuditableEntity {

    private static final Pattern PART_PATTERN = Pattern.compile("^[a-z][a-z_]{1,49}$");

    private final UUID uuid;
    private final String resource;
    private final String action;
    private String description;
    private final boolean system;
    private boolean active;

    public static Permission restore(UUID uuid, String resource, String action, String description,
                                     boolean system, boolean active, boolean deleted, Instant deletedAt,
                                     String deletedBy, String createdBy, Instant createdAt,
                                     String updatedBy, Instant updatedAt, long version) {
        Permission permission = new Permission(uuid, resource, action, description, system);
        if (system && (deleted || !active)) {
            throw new DomainException("System permissions must remain active and undeleted");
        }
        permission.active = active;
        permission.restoreAudit(createdBy, createdAt, updatedBy, updatedAt,
                deleted, deletedAt, deletedBy, version);
        return permission;
    }

    private Permission(UUID uuid, String resource, String action, String description, boolean system) {
        this.uuid = Objects.requireNonNull(uuid, "uuid");
        this.resource = validatePart(resource, "Resource");
        this.action = validatePart(action, "Action");
        if (this.resource.length() + this.action.length() + 1 > 100) {
            throw new DomainException("Permission name must be at most 100 characters");
        }
        this.description = boundedDescription(description);
        this.system = system;
        this.active = true;
    }

    public static Permission create(UUID uuid, String resource, String action, String description,
                                    String actor, Instant now) {
        Objects.requireNonNull(uuid, "uuid");
        Permission permission = new Permission(uuid, resource, action, description, false);
        permission.recordCreation(actor, now);
        return permission;
    }

    public static Permission seedSystem(UUID uuid, String resource, String action, String description,
                                        String actor, Instant now) {
        Objects.requireNonNull(uuid, "uuid");
        Permission permission = new Permission(uuid, resource, action, description, true);
        permission.recordCreation(actor, now);
        return permission;
    }

    public void updateDescription(String description, String actor, Instant now) {
        ensureMutable();
        String normalizedDescription = boundedDescription(description);
        recordUpdate(actor, now);
        this.description = normalizedDescription;
    }

    public void activate(String actor, Instant now) {
        ensureMutable();
        recordUpdate(actor, now);
        this.active = true;
    }

    public void deactivate(String actor, Instant now) {
        ensureMutable();
        recordUpdate(actor, now);
        this.active = false;
    }

    public void softDelete(String actor, Instant now) {
        ensureMutable();
        recordSoftDelete(actor, now);
        this.active = false;
    }

    public boolean isAssignable() {
        return active && !isDeleted();
    }

    public String name() {
        return resource + ":" + action;
    }

    private void ensureMutable() {
        if (system) {
            throw new DomainException("System permission '" + name() + "' cannot be changed or deleted");
        }
    }

    private static String validatePart(String value, String field) {
        if (value == null || !PART_PATTERN.matcher(value).matches()) {
            throw new DomainException(field + " must be lower_snake_case, 2-50 characters");
        }
        return value;
    }

    private static String boundedDescription(String description) {
        if (description != null && description.length() > 255) {
            throw new DomainException("Permission description must be at most 255 characters");
        }
        return description == null || description.isBlank() ? null : description.trim();
    }

    public UUID getUuid() {
        return uuid;
    }

    public String getResource() {
        return resource;
    }

    public String getAction() {
        return action;
    }

    public String getDescription() {
        return description;
    }

    public boolean isSystem() {
        return system;
    }

    public boolean isActive() {
        return active;
    }
}
