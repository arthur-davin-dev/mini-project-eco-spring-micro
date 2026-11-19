import { createContext, useMemo } from 'react';
import { useIam } from '../hooks/useIam';

export const AuthContext = createContext(null);

export function useAuth() {
    const iam = useIam();

    const can = (...authorities) => {
        if (!iam.user) return false;
        const roles = (iam.user.roles || []).map((r) =>
            (typeof r === 'string' ? r : r.name)?.toUpperCase()
        );
        if (roles.includes('ADMIN') || roles.includes('ROLE_ADMIN')) {
            return true;
        }
        const userPerms = (iam.user.authorities || iam.user.permissions || []).map((p) =>
            (typeof p === 'string' ? p : p.name)?.toLowerCase()
        );
        return authorities.some((auth) => {
            const norm = auth.toLowerCase();
            return userPerms.includes(norm) || roles.includes(auth.toUpperCase());
        });
    };

    return useMemo(() => ({
        ...iam,
        can,
        isAuthenticated: Boolean(iam.user),
    }), [iam]);
}

export default AuthContext;
