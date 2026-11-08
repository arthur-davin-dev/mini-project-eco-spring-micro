package kh.eco.istad.platform.authorization.domain.entity.user;

import kh.eco.istad.platform.authorization.domain.entity.AuditableEntity;
import kh.eco.istad.platform.authorization.domain.exception.DomainException;
import kh.eco.istad.platform.authorization.domain.valueobject.EmailAddress;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

public class Identity extends AuditableEntity {

    private final UUID uuid;
    private final IdentityProvider provider;
    private final String providerSubject;
    private String email;
    private boolean emailVerified;
    private String displayName;
    private String username;
    private String pictureUrl;
    private final Instant linkedAt;
    private Instant lastLoginAt;

    public static Identity restore(UUID uuid, IdentityProvider provider, String providerSubject, String email,
                                   boolean emailVerified, String displayName, String username,
                                   String pictureUrl, Instant linkedAt, Instant lastLoginAt,
                                   boolean deleted, Instant deletedAt, String deletedBy,
                                   String createdBy, Instant createdAt, String updatedBy,
                                   Instant updatedAt, long version) {
        Identity identity = new Identity(uuid, provider, providerSubject, email, emailVerified,
                displayName, username, pictureUrl, linkedAt);
        if (lastLoginAt != null && lastLoginAt.isBefore(identity.linkedAt)) {
            throw new DomainException("Identity login time cannot be before it was linked");
        }
        identity.lastLoginAt = lastLoginAt;
        identity.restoreAudit(createdBy, createdAt, updatedBy, updatedAt,
                deleted, deletedAt, deletedBy, version);
        return identity;
    }

    private Identity(UUID uuid, IdentityProvider provider, String providerSubject, String email,
                     boolean emailVerified, String displayName, String username, String pictureUrl,
                     Instant linkedAt) {
        this.uuid = Objects.requireNonNull(uuid, "uuid");
        this.provider = Objects.requireNonNull(provider, "provider");
        if (providerSubject == null || providerSubject.isBlank() || providerSubject.length() > 255) {
            throw new DomainException("Provider subject must be 1-255 characters");
        }
        this.providerSubject = providerSubject;
        this.email = normalizeEmail(email);
        if (emailVerified && this.email == null) {
            throw new DomainException("A verified identity email must be present");
        }
        this.emailVerified = emailVerified;
        this.displayName = boundedText(displayName, 150, "Display name");
        this.username = boundedText(username, 100, "Provider username");
        this.pictureUrl = boundedText(pictureUrl, 500, "Picture URL");
        this.linkedAt = Objects.requireNonNull(linkedAt, "linkedAt");
    }

    public static Identity link(UUID uuid, IdentityProvider provider, String providerSubject, String email,
                                boolean emailVerified, String displayName, String username, String pictureUrl,
                                String actor, Instant now) {
        Objects.requireNonNull(uuid, "uuid");
        Objects.requireNonNull(provider, "provider");
        Identity identity = new Identity(uuid, provider, providerSubject, email, emailVerified,
                displayName, username, pictureUrl, now);
        identity.recordCreation(actor, now);
        identity.lastLoginAt = now;
        return identity;
    }

    public void refreshFromProvider(String email, boolean emailVerified, String displayName,
                                    String username, String pictureUrl, String actor, Instant now) {
        String normalizedEmail = normalizeEmail(email);
        if (emailVerified && normalizedEmail == null) {
            throw new DomainException("A verified identity email must be present");
        }
        String normalizedDisplayName = boundedText(displayName, 150, "Display name");
        String normalizedUsername = boundedText(username, 100, "Provider username");
        String normalizedPictureUrl = boundedText(pictureUrl, 500, "Picture URL");
        recordUpdate(actor, now);
        this.email = normalizedEmail;
        this.emailVerified = emailVerified;
        this.displayName = normalizedDisplayName;
        this.username = normalizedUsername;
        this.pictureUrl = normalizedPictureUrl;
    }

    public void recordLogin(String actor, Instant now) {
        recordUpdate(actor, now);
        this.lastLoginAt = now;
    }

    void unlink(String actor, Instant now) {
        recordSoftDelete(actor, now);
    }

    public UUID getUuid() {
        return uuid;
    }

    public IdentityProvider getProvider() {
        return provider;
    }

    public String getProviderSubject() {
        return providerSubject;
    }

    public String getEmail() {
        return email;
    }

    public boolean isEmailVerified() {
        return emailVerified;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getUsername() {
        return username;
    }

    public String getPictureUrl() {
        return pictureUrl;
    }

    public Instant getLinkedAt() {
        return linkedAt;
    }

    public Instant getLastLoginAt() {
        return lastLoginAt;
    }

    private static String boundedText(String value, int maxLength, String field) {
        if (value == null || value.isBlank()) {
            return null;
        }
        String normalized = value.trim();
        if (normalized.length() > maxLength) {
            throw new DomainException(field + " must be at most " + maxLength + " characters");
        }
        return normalized;
    }

    private static String normalizeEmail(String email) {
        if (email == null || email.isBlank()) {
            return null;
        }
        return new EmailAddress(email).value();
    }
}
