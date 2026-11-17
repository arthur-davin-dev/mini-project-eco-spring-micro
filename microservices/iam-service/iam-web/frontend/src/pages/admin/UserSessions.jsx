import AdminUserSessionsPage from '../../features/admin/pages/AdminUserSessionsPage';
import { useAuth } from '../../auth/AuthContext';

export default function UserSessions() {
    const { locale, t } = useAuth();
    return <AdminUserSessionsPage locale={locale} t={t} />;
}
