import { useNavigate } from 'react-router-dom';
import AdminOverviewPage from '../../components/profile/AdminOverviewPage';
import { useAuth } from '../../auth/AuthContext';

export default function Overview() {
    const { token, locale, t } = useAuth();
    const navigate = useNavigate();

    return (
        <AdminOverviewPage
            token={token}
            locale={locale}
            t={t}
            setPage={(page) => {
                if (page === 'users') navigate('/admin/users');
                else if (page === 'roles') navigate('/admin/roles');
                else if (page === 'permissions') navigate('/admin/permissions');
                else if (page === 'clients') navigate('/admin/clients');
                else if (page === 'securityManagement' || page === 'security') navigate('/admin/security');
                else if (page === 'auditLogs' || page === 'audit') navigate('/admin/audit-logs');
                else if (page === 'systemConfig' || page === 'system') navigate('/admin/system-config');
                else navigate('/admin/' + page);
            }}
            onSelectUser={(user) => navigate(`/admin/users/${user.uuid || user.id}`)}
        />
    );
}
