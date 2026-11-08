package kh.eco.istad.platform.authorization.domain.entity;

import kh.eco.istad.platform.authorization.domain.exception.DomainException;

import java.time.Instant;
import java.util.Objects;

public abstract class AuditableEntity {

    private Instant createdAt;
    private String createdBy;
    private Instant updatedAt;
    private String updatedBy;
    private boolean deleted;
    private Instant deletedAt;
    private String deletedBy;
    private long version;

    protected AuditableEntity() {
    }

    protected void recordCreation(String actor, Instant now) {
        requireActor(actor);
        Objects.requireNonNull(now, "now");
        this.createdAt = now;
        this.createdBy = actor;
        this.updatedAt = now;
        this.updatedBy = actor;
        this.version = 0L;
    }

    protected void recordUpdate(String actor, Instant now) {
        requireActor(actor);
        Objects.requireNonNull(now, "now");
        if (deleted) {
            throw new DomainException("Deleted record cannot be modified");
        }
        if (now.isBefore(createdAt) || now.isBefore(updatedAt)) {
            throw new DomainException("Update time cannot be before existing audit timestamps");
        }
        this.updatedAt = now;
        this.updatedBy = actor;
    }

    /** Soft delete: the row stays for audit; it is never physically removed. */
    protected void recordSoftDelete(String actor, Instant now) {
        requireActor(actor);
        Objects.requireNonNull(now, "now");
        if (deleted) {
            throw new DomainException("Record is already deleted");
        }
        if (now.isBefore(createdAt) || now.isBefore(updatedAt)) {
            throw new DomainException("Deletion time cannot be before existing audit timestamps");
        }
        this.deleted = true;
        this.deletedAt = now;
        this.deletedBy = actor;
        this.updatedAt = now;
        this.updatedBy = actor;
    }

    /** Rehydrates persisted audit state; adapters should call this only while mapping rows. */
    protected final void restoreAudit(String createdBy, Instant createdAt, String updatedBy,
                                      Instant updatedAt, boolean deleted, Instant deletedAt,
                                      String deletedBy, long version) {
        requireActor(createdBy);
        requireActor(updatedBy);
        this.createdAt = Objects.requireNonNull(createdAt, "createdAt");
        this.updatedAt = Objects.requireNonNull(updatedAt, "updatedAt");
        if (updatedAt.isBefore(createdAt) || version < 0) {
            throw new DomainException("Invalid audit timestamps or version");
        }
        if ((deleted && (deletedAt == null || deletedBy == null || deletedBy.isBlank()))
                || (!deleted && (deletedAt != null || deletedBy != null))) {
            throw new DomainException("Deleted audit fields must be set only for deleted records");
        }
        if (deletedBy != null) {
            requireActor(deletedBy);
        }
        if (deleted && deletedAt.isBefore(createdAt)) {
            throw new DomainException("Deletion time cannot be before creation time");
        }
        this.createdBy = createdBy;
        this.updatedBy = updatedBy;
        this.deleted = deleted;
        this.deletedAt = deletedAt;
        this.deletedBy = deletedBy;
        this.version = version;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public String getUpdatedBy() {
        return updatedBy;
    }

    public boolean isDeleted() {
        return deleted;
    }

    public Instant getDeletedAt() {
        return deletedAt;
    }

    public String getDeletedBy() {
        return deletedBy;
    }

    public long getVersion() {
        return version;
    }

    /** Synchronizes the optimistic-lock version after an adapter successfully persists this entity. */
    public final void synchronizeVersion(long persistedVersion) {
        if (persistedVersion < 0) {
            throw new IllegalArgumentException("persistedVersion must not be negative");
        }
        this.version = persistedVersion;
    }

    private static void requireActor(String actor) {
        if (actor == null || actor.isBlank() || actor.length() > 100) {
            throw new DomainException("Audit actor must be 1-100 characters");
        }
    }
}
