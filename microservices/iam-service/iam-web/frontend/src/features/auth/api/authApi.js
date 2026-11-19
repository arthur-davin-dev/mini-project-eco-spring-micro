export const authApi = {
    getCsrf: async () => {
        try {
            const res = await fetch('/account/csrf', { credentials: 'same-origin' });
            if (res.ok) return await res.json();
        } catch (_e) {
            // ignore
        }
        return {};
    },

    getSession: async () => {
        const res = await fetch('/account/session', { credentials: 'same-origin' });
        if (!res.ok) throw new Error('No active session');
        return await res.json();
    },

    logout: async () => {
        try {
            const csrf = await authApi.getCsrf();
            const headers = csrf.headerName ? { [csrf.headerName]: csrf.token } : {};
            await fetch('/logout', {
                method: 'POST',
                credentials: 'same-origin',
                headers,
            });
        } catch (_e) {
            // ignore
        }
        window.location.href = '/login?logout';
    },

    requestPasswordReset: async (email) => {
        const csrf = await authApi.getCsrf();
        const headers = {
            'Content-Type': 'application/json',
            ...(csrf.headerName ? { [csrf.headerName]: csrf.token } : {}),
        };
        const res = await fetch('/account/password/reset-request', {
            method: 'POST',
            credentials: 'same-origin',
            headers,
            body: JSON.stringify({ email }),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || 'Password reset request failed');
        }
        return await res.json();
    },
};

export default authApi;
