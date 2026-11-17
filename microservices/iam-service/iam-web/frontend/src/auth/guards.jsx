import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import AccountLoadingSkeleton from '../components/profile/AccountLoadingSkeleton';

export function RequireAuth() {
    const { user, loading, t } = useAuth();
    const location = useLocation();

    if (loading && !user) {
        return <AccountLoadingSkeleton label={t?.loading || 'Loading...'} />;
    }

    if (!user) {
        const returnTo = encodeURIComponent(location.pathname + location.search);
        return <Navigate to={`/login?returnTo=${returnTo}`} replace />;
    }

    return <Outlet />;
}

export function RequireAuthority({ any = [], children }) {
    const { can, user, loading, t } = useAuth();

    if (loading && !user) {
        return <AccountLoadingSkeleton label={t?.loading || 'Loading...'} />;
    }

    const authorities = Array.isArray(any) ? any : [any];
    if (!can(...authorities)) {
        return <Navigate to="/account/profile" replace />;
    }

    return children ? children : <Outlet />;
}
