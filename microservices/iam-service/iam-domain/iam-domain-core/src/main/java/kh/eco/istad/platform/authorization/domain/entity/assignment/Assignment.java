package kh.eco.istad.platform.authorization.domain.entity.assignment;

import kh.eco.istad.platform.authorization.domain.exception.DomainException;

import java.time.Instant;
import java.util.Objects;

public abstract class Assignment {

    private final Instant assignedAt;
    private final String assignedBy;
    private final Instant expiresAt;
    private String reason;
    private Instant revokedAt;
    private String revokedBy;

    protected final void restoreRevocation(Instant revokedAt, String revokedBy, String reason) {
        if ((revokedAt == null) != (revokedBy == null)) {
            throw new DomainException("Revocation time and actor must either both be present or both be absent");
        }
        if (revokedAt != null && (revokedBy.isBlank() || revokedAt.isBefore(assignedAt))) {
            throw new DomainException("Invalid assignment revocation state");
        }
        if (revokedBy != null) {
            validateActor(revokedBy, "Revocation actor");
        }
        validateReason(reason);
        this.revokedAt = revokedAt;
        this.revokedBy = revokedBy;
        this.reason = validateReason(reason);
    }

    protected Assignment(Instant assignedAt, String assignedBy, Instant expiresAt, String reason) {
        Objects.requireNonNull(assignedAt, "assignedAt");
        Objects.requireNonNull(assignedBy, "assignedBy");
        validateActor(assignedBy, "Assignment actor");
        validateReason(reason);
        if (expiresAt != null && !expiresAt.isAfter(assignedAt)) {
            throw new DomainException("Expiry must be after the assignment time");
        }
        this.assignedAt = assignedAt;
        this.assignedBy = assignedBy;
        this.expiresAt = expiresAt;
        this.reason = validateReason(reason);
    }

    public boolean isActiveAt(Instant now) {
        Objects.requireNonNull(now, "now");
        return revokedAt == null && (expiresAt == null || now.isBefore(expiresAt));
    }

    public void revoke(String actor, String reason, Instant now) {
        validateActor(actor, "Revocation actor");
        Objects.requireNonNull(now, "now");
        if (now.isBefore(assignedAt)) {
            throw new DomainException("Revocation cannot be before assignment time");
        }
        if (revokedAt != null) {
            throw new DomainException("Assignment is already revoked");
        }
        String normalizedReason = validateReason(reason);
        this.revokedAt = now;
        this.revokedBy = actor;
        this.reason = normalizedReason;
    }

    public Instant getAssignedAt() {
        return assignedAt;
    }

    public String getAssignedBy() {
        return assignedBy;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public String getReason() {
        return reason;
    }

    public Instant getRevokedAt() {
        return revokedAt;
    }

    public String getRevokedBy() {
        return revokedBy;
    }

    private static void validateActor(String actor, String field) {
        if (actor == null || actor.isBlank() || actor.length() > 100) {
            throw new DomainException(field + " must be 1-100 characters");
        }
    }

    private static String validateReason(String reason) {
        if (reason != null && reason.length() > 255) {
            throw new DomainException("Assignment reason must be at most 255 characters");
        }
        return reason == null || reason.isBlank() ? null : reason.trim();
    }
}
