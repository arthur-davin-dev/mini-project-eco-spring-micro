import { useNavigate } from 'react-router-dom';
import AdminSecurityManagementPage from '../../features/admin/pages/AdminSecurityManagementPage';
import { useAuth } from '../../auth/AuthContext';

export default function SecurityManagement() {
    const { token, locale, t } = useAuth();
    const navigate = useNavigate();

    return (
        <AdminSecurityManagementPage
            token={token}
            locale={locale}
            t={t}
            onSelectUser={(user) => {
                const id = typeof user === 'string' ? user : (user?.uuid || user?.id);
                if (id && id !== 'undefined') {
                    navigate(`/admin/users/${id}`);
                }
            }}
        />
    );
}
