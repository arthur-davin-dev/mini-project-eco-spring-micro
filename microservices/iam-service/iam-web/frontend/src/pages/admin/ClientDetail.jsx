import { useParams } from 'react-router-dom';
import AdminClientsPage from '../../features/admin/pages/AdminClientsPage';
import { useAuth } from '../../auth/AuthContext';

export default function ClientDetail() {
    const { id } = useParams();
    const { locale, t } = useAuth();

    return (
        <AdminClientsPage
            initialClientId={id}
            locale={locale}
            t={t}
        />
    );
}
