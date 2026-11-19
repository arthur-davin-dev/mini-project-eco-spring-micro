import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import SecurityPage from './SecurityPage';
import { useAuth } from '../../../contexts/AuthContext';
import { accountApi as profileApi } from '../../../features/account/api/accountApi';

export default function Password() {
    const { token, locale, t, setError } = useAuth();
    const outletCtx = useOutletContext() || {};
    const setToast = outletCtx.setToast;
    const [working, setWorking] = useState(false);

    async function handleSave(password) {
        if (!password.currentPassword || !password.newPassword || !password.confirmPassword) {
            setError(t.required || 'Please fill all password fields.');
            return false;
        }
        if (password.newPassword !== password.confirmPassword) {
            setError(t.mismatch || 'Passwords do not match.');
            return false;
        }
        setWorking(true);
        setError('');
        try {
            await profileApi.changePassword(token, password);
            if (setToast) {
                setToast(t.passwordSaved || 'Password changed successfully.');
                setTimeout(() => setToast(''), 3000);
            }
            return true;
        } catch {
            setError(t.notSaved || 'Password change failed.');
            return false;
        } finally {
            setWorking(false);
        }
    }

    return (
        <SecurityPage
            t={t}
            locale={locale}
            working={working}
            onSave={handleSave}
        />
    );
}
