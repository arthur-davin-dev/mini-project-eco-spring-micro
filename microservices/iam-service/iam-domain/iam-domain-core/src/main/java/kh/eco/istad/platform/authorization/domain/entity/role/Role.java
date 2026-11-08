package kh.eco.istad.platform.authorization.domain.entity.role;

import kh.eco.istad.platform.authorization.domain.entity.AuditableEntity;
import kh.eco.istad.platform.authorization.domain.exception.DomainException;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;
import java.util.regex.Pattern;

public class Role extends AuditableEntity {

    private static final Pattern NAME_PATTERN = Pattern.compile("^[A-Z][A-Z0-9_]{1,49}$");

    private final UUID uuid;
    private final String name;
    private String description;
    private final boolean system;
    private boolean active;

    public static Role restore(UUID uuid, String name, String description, boolean system, boolean active,
                               boolean deleted, Instant deletedAt, String deletedBy,
                               String createdBy, Instant createdAt, String updatedBy, Instant updatedAt,
                               long version) {
        Role role = new Role(uuid, name, description, system);
        if (system && (deleted || !active)) {
            throw new DomainException("System roles must remain active and undeleted");
        }
        role.active = active;
        role.restoreAudit(createdBy, createdAt, updatedBy, updatedAt, deleted, deletedAt, deletedBy, version);
        return role;
    }

    private Role(UUID uuid, String name, String description, boolean system) {
        this.uuid = Objects.requireNonNull(uuid, "uuid");
        this.name = validateName(name);
        this.description = boundedDescription(description);
        this.system = system;
        this.active = true;
    }

    public static Role create(UUID uuid, String name, String description, String actor, Instant now) {
        Objects.requireNonNull(uuid, "uuid");
        Role role = new Role(uuid, name, description, false);
        role.recordCreation(actor, now);
        return role;
    }

    public static Role seedSystem(UUID uuid, String name, String description, String actor, Instant now) {
        Objects.requireNonNull(uuid, "uuid");
        Role role = new Role(uuid, name, description, true);
        role.recordCreation(actor, now);
        return role;
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

    public String authorityName() {
        return "ROLE_" + name;
    }

    private void ensureMutable() {
        if (system) {
            throw new DomainException("System role '" + name + "' cannot be changed or deleted");
        }
    }

    private static String validateName(String name) {
        if (name == null || !NAME_PATTERN.matcher(name).matches()) {
            throw new DomainException("Role name must be UPPER_SNAKE_CASE, 2-50 characters");
        }
        return name;
    }

    private static String boundedDescription(String description) {
        if (description != null && description.length() > 255) {
            throw new DomainException("Role description must be at most 255 characters");
        }
        return description == null || description.isBlank() ? null : description.trim();
    }

    public UUID getUuid() {
        return uuid;
    }

    public String getName() {
        return name;
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
