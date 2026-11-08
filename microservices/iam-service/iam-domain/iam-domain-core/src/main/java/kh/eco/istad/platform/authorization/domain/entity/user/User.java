package kh.eco.istad.platform.authorization.domain.entity.user;

import kh.eco.istad.platform.authorization.domain.entity.AuditableEntity;
import kh.eco.istad.platform.authorization.domain.exception.DomainException;
import kh.eco.istad.platform.authorization.domain.exception.NotFoundException;
import kh.eco.istad.platform.authorization.domain.valueobject.EmailAddress;
import kh.eco.istad.platform.authorization.domain.valueobject.Username;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

public class User extends AuditableEntity {

    public static final int MAX_FAILED_LOGIN_ATTEMPTS = 5;

    private final UUID uuid;
    private Username username;
    private EmailAddress email;
    private boolean emailVerified;
    private String passwordHash; // null for social-only users
    private UserProfile profile;
    private boolean enabled = true;
    private boolean accountNonExpired = true;
    private boolean accountNonLocked = true;
    private boolean credentialsNonExpired = true;
    private int failedLoginAttempts;
    private Instant lastLoginAt;
    private Instant passwordChangedAt;
    private final List<Identity> identities = new ArrayList<>();

    public static User restore(UUID uuid, Username username, EmailAddress email, boolean emailVerified,
                               String passwordHash, UserProfile profile, boolean enabled,
                               boolean accountNonExpired, boolean accountNonLocked,
                               boolean credentialsNonExpired, int failedLoginAttempts,
                               Instant lastLoginAt, Instant passwordChangedAt, List<Identity> identities,
                               boolean deleted, Instant deletedAt, String deletedBy,
                               String createdBy, Instant createdAt, String updatedBy,
                               Instant updatedAt, long version) {
        User user = new User(uuid, username, email, emailVerified, passwordHash, profile);
        if (failedLoginAttempts < 0 || (passwordHash != null && passwordHash.isBlank())) {
            throw new DomainException("Invalid persisted user credentials state");
        }
        if (deleted && enabled) {
            throw new DomainException("Deleted users must be disabled");
        }
        user.enabled = enabled;
        user.accountNonExpired = accountNonExpired;
        user.accountNonLocked = accountNonLocked;
        user.credentialsNonExpired = credentialsNonExpired;
        user.failedLoginAttempts = failedLoginAttempts;
        user.lastLoginAt = lastLoginAt;
        user.passwordChangedAt = passwordChangedAt;
        user.identities.addAll(identities);
        user.restoreAudit(createdBy, createdAt, updatedBy, updatedAt, deleted, deletedAt, deletedBy, version);
        return user;
    }

    private User(UUID uuid, Username username, EmailAddress email, boolean emailVerified,
                 String passwordHash, UserProfile profile) {
        this.uuid = uuid;
        this.username = username;
        this.email = email;
        this.emailVerified = emailVerified;
        this.passwordHash = passwordHash;
        this.profile = Objects.requireNonNull(profile, "profile");
    }

    public static User register(UUID uuid, Username username, EmailAddress email, String passwordHash,
                                UserProfile profile, String actor, Instant now) {
        Objects.requireNonNull(uuid, "uuid");
        Objects.requireNonNull(username, "username");
        Objects.requireNonNull(email, "email");
        if (passwordHash == null || passwordHash.isBlank()) {
            throw new DomainException("Password hash must not be blank");
        }
        User user = new User(uuid, username, email, false, passwordHash, profile);
        user.recordCreation(actor, now);
        return user;
    }

    public static User provisionFromSocial(UUID uuid, Username username, EmailAddress email,
                                           boolean emailVerified, UserProfile profile,
                                           Identity identity, String actor, Instant now) {
        Objects.requireNonNull(uuid, "uuid");
        Objects.requireNonNull(identity, "identity");
        User user = new User(uuid, username, email, emailVerified, null, profile);
        user.recordCreation(actor, now);
        user.identities.add(identity);
        user.lastLoginAt = now;
        return user;
    }

    public void updateProfile(UserProfile profile, String actor, Instant now) {
        Objects.requireNonNull(profile, "profile");
        recordUpdate(actor, now);
        this.profile = profile;
    }

    public void changePassword(String newPasswordHash, String actor, Instant now) {
        if (newPasswordHash == null || newPasswordHash.isBlank()) {
            throw new DomainException("Password hash must not be blank");
        }
        recordUpdate(actor, now);
        this.passwordHash = newPasswordHash;
        this.passwordChangedAt = now;
    }

    public void ensureCanSignIn() {
        if (isDeleted()) {
            throw new DomainException("Account is deleted");
        }
        if (!enabled) {
            throw new DomainException("Account is disabled");
        }
        if (!accountNonExpired) {
            throw new DomainException("Account is expired");
        }
        if (!accountNonLocked) {
            throw new DomainException("Account is locked");
        }
        if (!credentialsNonExpired) {
            throw new DomainException("Credentials are expired");
        }
    }

    public void recordSuccessfulLogin(String actor, Instant now) {
        Objects.requireNonNull(now, "now");
        recordUpdate(actor, now);
        this.failedLoginAttempts = 0;
        this.lastLoginAt = now;
    }

    public void recordFailedLogin(String actor, Instant now) {
        recordUpdate(actor, now);
        this.failedLoginAttempts++;
        if (this.failedLoginAttempts >= MAX_FAILED_LOGIN_ATTEMPTS) {
            this.accountNonLocked = false;
        }
    }

    public void enable(String actor, Instant now) {
        recordUpdate(actor, now);
        this.enabled = true;
    }

    public void disable(String actor, Instant now) {
        recordUpdate(actor, now);
        this.enabled = false;
    }

    public void lock(String actor, Instant now) {
        recordUpdate(actor, now);
        this.accountNonLocked = false;
    }

    public void unlock(String actor, Instant now) {
        recordUpdate(actor, now);
        this.accountNonLocked = true;
        this.failedLoginAttempts = 0;
    }

    public void linkIdentity(Identity identity, String actor, Instant now) {
        Objects.requireNonNull(identity, "identity");
        if (identity.isDeleted()) {
            throw new DomainException("A deleted identity cannot be linked");
        }
        boolean alreadyLinked = getActiveIdentities().stream()
                .anyMatch(existing -> existing.getProvider() == identity.getProvider());
        if (alreadyLinked) {
            throw new DomainException("A " + identity.getProvider() + " account is already linked");
        }
        recordUpdate(actor, now);
        identities.add(identity);
    }

    public void unlinkIdentity(UUID identityUuid, String actor, Instant now) {
        Identity target = findActiveIdentity(identityUuid)
                .orElseThrow(() -> new NotFoundException("Identity not found"));
        int remainingSignInMethods = (hasPassword() ? 1 : 0) + getActiveIdentities().size() - 1;
        if (remainingSignInMethods < 1) {
            throw new DomainException("Cannot unlink the last sign-in method");
        }
        recordUpdate(actor, now);
        target.unlink(actor, now);
    }

    public void softDelete(String actor, Instant now) {
        recordSoftDelete(actor, now);
        this.enabled = false;
    }

    public boolean hasPassword() {
        return passwordHash != null;
    }

    public Optional<Identity> findActiveIdentity(UUID identityUuid) {
        return getActiveIdentities().stream()
                .filter(identity -> identity.getUuid().equals(identityUuid))
                .findFirst();
    }

    public List<Identity> getActiveIdentities() {
        return identities.stream().filter(identity -> !identity.isDeleted()).toList();
    }

    /** Includes unlinked identities so persistence adapters retain their audit history. */
    public List<Identity> getIdentities() {
        return List.copyOf(identities);
    }

    public UUID getUuid() {
        return uuid;
    }

    public Username getUsername() {
        return username;
    }

    public EmailAddress getEmail() {
        return email;
    }

    public boolean isEmailVerified() {
        return emailVerified;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public UserProfile getProfile() {
        return profile;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public boolean isAccountNonExpired() {
        return accountNonExpired;
    }

    public boolean isAccountNonLocked() {
        return accountNonLocked;
    }

    public boolean isCredentialsNonExpired() {
        return credentialsNonExpired;
    }

    public int getFailedLoginAttempts() {
        return failedLoginAttempts;
    }

    public Instant getLastLoginAt() {
        return lastLoginAt;
    }

    public Instant getPasswordChangedAt() {
        return passwordChangedAt;
    }
}
