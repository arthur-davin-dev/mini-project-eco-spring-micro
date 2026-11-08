package kh.eco.istad.platform.authorization.domain.service;

import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

public final class EffectivePermissions {

    private EffectivePermissions() {
    }

    public static Set<String> calculate(Set<String> activeRolePermissions,
                                        Set<String> directGrants,
                                        Set<String> directDenies) {
        Set<String> effective = new HashSet<>(activeRolePermissions);
        effective.addAll(directGrants);
        effective.removeAll(directDenies);
        return Collections.unmodifiableSet(effective);
    }
}
