import AdminUserLoginHistoryPage from '../../features/admin/pages/AdminUserLoginHistoryPage';
import { useAuth } from '../../auth/AuthContext';

export default function AdminLoginHistory() {
    const { token, locale, t } = useAuth();
    return <AdminUserLoginHistoryPage token={token} locale={locale} t={t} />;
}
