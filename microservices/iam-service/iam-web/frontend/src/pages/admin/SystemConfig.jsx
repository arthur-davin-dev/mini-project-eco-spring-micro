import AdminSystemConfigPage from '../../features/admin/pages/AdminSystemConfigPage';
import { useAuth } from '../../auth/AuthContext';

export default function SystemConfig() {
    const { locale, t } = useAuth();
    return <AdminSystemConfigPage locale={locale} t={t} />;
}
