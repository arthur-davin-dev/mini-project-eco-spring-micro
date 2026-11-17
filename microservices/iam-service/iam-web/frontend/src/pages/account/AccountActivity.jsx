import AccountActivityPage from '../../components/profile/AccountActivityPage';
import { useAuth } from '../../auth/AuthContext';

export default function AccountActivity() {
    const { user, locale, t } = useAuth();
    return <AccountActivityPage user={user} locale={locale} t={t} />;
}
