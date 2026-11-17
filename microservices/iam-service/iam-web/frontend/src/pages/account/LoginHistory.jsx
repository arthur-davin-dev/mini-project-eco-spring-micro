import LoginHistoryPage from '../../components/profile/LoginHistoryPage';
import { useAuth } from '../../auth/AuthContext';

export default function LoginHistory() {
    const { user, locale, t } = useAuth();
    return <LoginHistoryPage user={user} locale={locale} t={t} />;
}
