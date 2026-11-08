package kh.eco.istad.platform.authorization.domain.service;

import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class EffectivePermissionsTest {

    @Test
    void directGrantsAreAddedAndDirectDeniesOverrideRoleGrants() {
        Set<String> effective = EffectivePermissions.calculate(
                Set.of("order:read", "order:update"),
                Set.of("report:read"),
                Set.of("order:update"));

        assertEquals(Set.of("order:read", "report:read"), effective);
    }

    @Test
    void returnedPermissionsCannotBeMutated() {
        Set<String> effective = EffectivePermissions.calculate(Set.of("user:read"), Set.of(), Set.of());

        assertThrows(UnsupportedOperationException.class, () -> effective.add("user:delete"));
    }
}
