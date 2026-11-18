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
            onSelectClient={(client) => {
                const id = typeof client === 'string' ? client : (client?.clientId || client?.id);
                if (id && id !== 'undefined') {
                    navigate(`/admin/clients/${id}`);
                }
            }}
        />
    );
}
