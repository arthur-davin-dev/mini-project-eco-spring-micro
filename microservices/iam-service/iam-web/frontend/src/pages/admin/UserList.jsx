import { useNavigate } from 'react-router-dom';
import AdminUsersPage from '../../features/admin/pages/AdminUsersPage';
import { useAuth } from '../../auth/AuthContext';

export default function UserList() {
    const { token, locale, t } = useAuth();
    const navigate = useNavigate();

    return (
        <AdminUsersPage
            token={token}
            locale={locale}
            t={t}
            onSelectUser={(user) => navigate(`/admin/users/${user.uuid || user.id}`)}
        />
    );
}
