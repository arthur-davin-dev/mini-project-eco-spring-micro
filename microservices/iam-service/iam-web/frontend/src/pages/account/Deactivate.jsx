import { useNavigate } from 'react-router-dom';
import DeactivationPage from '../../components/profile/DeactivationPage';
import { useAuth } from '../../auth/AuthContext';

export default function Deactivate() {
    const { user, locale, t } = useAuth();
    const navigate = useNavigate();

    return (
        <DeactivationPage
            user={user}
            locale={locale}
            t={t}
            onBack={() => navigate('/account/profile')}
        />
    );
}
