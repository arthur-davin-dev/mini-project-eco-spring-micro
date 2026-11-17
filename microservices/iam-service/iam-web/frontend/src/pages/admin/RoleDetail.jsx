import { useNavigate, useParams } from 'react-router-dom';
import AdminRolesPage from '../../features/admin/pages/AdminRolesPage';
import { useAuth } from '../../auth/AuthContext';

export default function RoleDetail() {
    const { id } = useParams();
    const { token, locale, t } = useAuth();
    const navigate = useNavigate();

    return (
        <AdminRolesPage
            token={token}
            locale={locale}
            t={t}
            selectedRoleId={id}
            onBack={() => navigate('/admin/roles')}
        />
    );
}
