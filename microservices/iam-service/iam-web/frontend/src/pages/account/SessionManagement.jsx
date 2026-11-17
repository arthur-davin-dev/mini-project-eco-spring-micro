import { useNavigate, useOutletContext } from 'react-router-dom';
import SessionManagementPage from '../../components/profile/SessionManagementPage';
import { useAuth } from '../../auth/AuthContext';

export default function SessionManagement() {
    const { user, locale, t } = useAuth();
    const navigate = useNavigate();
    const outletCtx = useOutletContext() || {};

    return (
        <SessionManagementPage
            user={user}
            locale={locale}
            t={t}
            setPage={(page) => {
                if (page === 'sessions') navigate('/account/sessions');
                else navigate('/account/' + page);
            }}
            onSignOut={outletCtx.handleSignOut}
        />
    );
}
