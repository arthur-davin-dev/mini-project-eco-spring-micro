import AdminPermissionsPage from '../../features/admin/pages/AdminPermissionsPage';
import { useAuth } from '../../auth/AuthContext';

export default function PermissionList() {
    const { token, locale, t } = useAuth();
    return <AdminPermissionsPage token={token} locale={locale} t={t} />;
}
