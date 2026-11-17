import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import LinkedAccountsPage from '../../components/profile/LinkedAccountsPage';
import { useAuth } from '../../auth/AuthContext';
import { profileApi } from '../../features/profile/api/profileApi';
import { formatProvider } from '../../utils/accountFormat';

export default function LinkedAccounts() {
    const { token, identities, setIdentities, t, setError } = useAuth();
    const outletCtx = useOutletContext() || {};
    const setToast = outletCtx.setToast;
    const [working, setWorking] = useState(false);

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const linked = searchParams.get('linked');
        const linkError = searchParams.get('link_error');
        if (linked) {
            if (setToast) {
                setToast(`${formatProvider(linked)} connected successfully.`);
                setTimeout(() => setToast(''), 3000);
            }
            profileApi.getLinkedAccounts(token).then((data) => {
                if (Array.isArray(data)) setIdentities(data);
            }).catch(() => {});
            window.history.replaceState(null, '', window.location.pathname);
        } else if (linkError) {
            if (linkError === 'already_linked') {
                setError('This provider account is already linked to another user.');
            } else {
                setError('Failed to connect provider. Please try again.');
            }
            window.history.replaceState(null, '', window.location.pathname);
        }
    }, [token, setIdentities, setError, setToast]);

    async function handleUnlink(identity) {
        if (!window.confirm(`${t.unlink || 'Unlink'} ${identity.provider}?`)) return;
        setWorking(true);
        setError('');
        try {
            await profileApi.unlinkAccount(token, identity.uuid);
            setIdentities((current) => current.filter((item) => item.uuid !== identity.uuid));
            if (setToast) {
                setToast(t.saved || 'Account unlinked.');
                setTimeout(() => setToast(''), 3000);
            }
        } catch {
            setError(t.notSaved || 'Failed to unlink account.');
        } finally {
            setWorking(false);
        }
    }

    function handleLink(event, provider) {
        event?.preventDefault?.();
        setWorking(true);
        setError('');
        window.location.href = `/profile/accounts/link/${provider}`;
    }

    return (
        <LinkedAccountsPage
            identities={identities}
            working={working}
            t={t}
            onUnlink={handleUnlink}
            onLink={handleLink}
        />
    );
}
