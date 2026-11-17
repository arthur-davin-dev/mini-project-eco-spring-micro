import AdminAuditLogsPage from '../../features/admin/pages/AdminAuditLogsPage';
import { useAuth } from '../../auth/AuthContext';

export default function AuditLogs() {
    const { locale, t } = useAuth();
    return <AdminAuditLogsPage locale={locale} t={t} />;
}
