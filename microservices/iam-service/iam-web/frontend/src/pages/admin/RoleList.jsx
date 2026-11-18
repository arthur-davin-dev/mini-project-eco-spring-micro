import { useNavigate } from 'react-router-dom';
import AdminRolesPage from '../../features/admin/pages/AdminRolesPage';
import { useAuth } from '../../auth/AuthContext';

export default function RoleList() {
    const { token, locale, t } = useAuth();
    const navigate = useNavigate();

    return (
        <AdminRolesPage
            token={token}
            locale={locale}
            t={t}
            onSelectRole={(role) => {
                const id = typeof role === 'string' ? role : (role?.uuid || role?.id);
                if (id && id !== 'undefined') {
                    navigate(`/admin/roles/${id}`);
                }
            }}
        />
    );
}
