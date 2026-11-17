import { useNavigate, useParams } from 'react-router-dom';
import AdminUserDetailPage from '../../features/admin/pages/AdminUserDetailPage';
import { useAuth } from '../../auth/AuthContext';

export default function UserDetail() {
    const { id } = useParams();
    const { token, locale, t } = useAuth();
    const navigate = useNavigate();

    return (
        <AdminUserDetailPage
            userId={id}
            token={token}
            locale={locale}
            t={t}
            onBack={() => navigate('/admin/users')}
        />
    );
}
