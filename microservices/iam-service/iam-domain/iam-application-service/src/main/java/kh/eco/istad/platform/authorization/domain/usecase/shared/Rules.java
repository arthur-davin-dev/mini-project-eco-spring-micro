package kh.eco.istad.platform.authorization.domain.usecase.shared;

import kh.eco.istad.platform.authorization.domain.exception.ConflictException;
import kh.eco.istad.platform.authorization.domain.exception.NotFoundException;
import kh.eco.istad.platform.authorization.domain.port.out.PermissionRepository;
import kh.eco.istad.platform.authorization.domain.port.out.RoleRepository;
import kh.eco.istad.platform.authorization.domain.port.out.UserRepository;
import kh.eco.istad.platform.authorization.domain.entity.permission.Permission;
import kh.eco.istad.platform.authorization.domain.entity.role.Role;
import kh.eco.istad.platform.authorization.domain.exception.DomainException;
import kh.eco.istad.platform.authorization.domain.entity.user.User;
import kh.eco.istad.platform.authorization.domain.valueobject.EmailAddress;
import kh.eco.istad.platform.authorization.domain.valueobject.Username;

import java.util.UUID;

public final class Rules {

    public static final int MIN_PASSWORD_LENGTH = 8;
    public static final int MAX_PASSWORD_LENGTH = 72;

    private Rules() {
    }

    public static void checkNewPassword(String password, String confirmPassword) {
        if (password == null || password.length() < MIN_PASSWORD_LENGTH || password.length() > MAX_PASSWORD_LENGTH) {
            throw new DomainException("Password must be " + MIN_PASSWORD_LENGTH + "-" + MAX_PASSWORD_LENGTH
                    + " characters");
        }
        if (!password.equals(confirmPassword)) {
            throw new DomainException("Passwords do not match");
        }
    }

    public static void ensureUsernameAndEmailAvailable(UserRepository users, Username username, EmailAddress email) {
        if (users.existsByUsername(username.value())) {
            throw new ConflictException("Username '" + username.value() + "' is already taken");
        }
        if (users.existsByEmail(email.value())) {
            throw new ConflictException("Email '" + email.value() + "' is already registered");
        }
    }

    public static User loadUser(UserRepository users, UUID uuid) {
        return users.findByUuid(uuid).orElseThrow(() -> new NotFoundException("User not found: " + uuid));
    }

    public static Role loadRole(RoleRepository roles, UUID uuid) {
        return roles.findByUuid(uuid).filter(role -> !role.isDeleted())
                .orElseThrow(() -> new NotFoundException("Role not found: " + uuid));
    }

    public static Permission loadPermission(PermissionRepository permissions, UUID uuid) {
        return permissions.findByUuid(uuid).filter(permission -> !permission.isDeleted())
                .orElseThrow(() -> new NotFoundException("Permission not found: " + uuid));
    }
}
