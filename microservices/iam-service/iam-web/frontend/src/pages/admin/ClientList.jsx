import { useNavigate } from 'react-router-dom';
import AdminClientsPage from '../../features/admin/pages/AdminClientsPage';
import { useAuth } from '../../auth/AuthContext';

export default function ClientList() {
    const { locale, t } = useAuth();
    const navigate = useNavigate();

    return (
        <AdminClientsPage
            locale={locale}
            t={t}
            onSelectClient={(client) => navigate(`/admin/clients/${client.clientId || client.id}`)}
        />
    );
}
