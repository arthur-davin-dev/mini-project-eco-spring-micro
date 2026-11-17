import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import ProfilePage from '../../components/profile/ProfilePage';
import { useAuth } from '../../auth/AuthContext';
import { profileApi } from '../../features/profile/api/profileApi';

export default function Profile() {
    const { user, setUser, token, identities, roleNames, locale, setLocale, t, setError } = useAuth();
    const navigate = useNavigate();
    const outletCtx = useOutletContext() || {};
    const setToast = outletCtx.setToast;
    const [working, setWorking] = useState(false);

    async function handleSave(profile) {
        setWorking(true);
        setError('');
        try {
            const updated = await profileApi.updateProfile(token, profile);
            setUser(updated);
            if (updated.locale && updated.locale !== locale) setLocale(updated.locale);
            if (setToast) {
                setToast(t?.saved || 'Profile changes saved.');
                setTimeout(() => setToast(''), 3000);
            }
            return true;
        } catch {
            setError(t?.notSaved || 'Failed to save changes.');
            return false;
        } finally {
            setWorking(false);
        }
    }

    return (
        <ProfilePage
            user={user}
            identities={identities}
            roleNames={roleNames}
            locale={locale}
            t={t}
            working={working}
            onSave={handleSave}
            setPage={(page) => {
                if (page === 'deactivate') navigate('/account/deactivate');
                else navigate('/account/' + page);
            }}
        />
    );
}
