import { useNavigate } from 'react-router-dom';
import ActiveSessionsPage from '../../components/profile/ActiveSessionsPage';
import { useAuth } from '../../auth/AuthContext';

export default function Sessions() {
    const { user, locale, t } = useAuth();
    const navigate = useNavigate();

    return (
        <ActiveSessionsPage
            user={user}
            locale={locale}
            t={t}
            setPage={(page) => {
                if (page === 'sessionManagement') navigate('/account/session-management');
                else navigate('/account/' + page);
            }}
        />
    );
}
