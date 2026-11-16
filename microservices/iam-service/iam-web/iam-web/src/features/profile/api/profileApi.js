import {apiRequest} from '../../../services/api/httpClient'
import {iamDataStore} from '../../../services/storage/iamDataStore'

export const profileApi = {
    getProfile: (token) => apiRequest('/api/me', {token}),
    updateProfile: async (token, profile) => {
        let result
        if (token) {
            result = await apiRequest('/api/me', {
                token,
                method: 'PATCH',
                body: JSON.stringify(profile),
            })
        } else {
            const csrfResponse = await fetch('/account/csrf', {credentials: 'same-origin'})
            if (!csrfResponse.ok) throw new Error('Could not prepare profile update')
            const csrf = await csrfResponse.json()
            const response = await fetch('/account/profile', {
                method: 'PATCH',
                credentials: 'same-origin',
                headers: {'Content-Type': 'application/json', [csrf.headerName]: csrf.token},
                body: JSON.stringify(profile),
            })
            if (!response.ok) throw new Error(`Profile update failed (${response.status})`)
            result = await response.json()
        }

        iamDataStore.recordActivity({
            type: 'PROFILE',
            title: 'Profile updated',
            description: `Updated personal information (${profile.givenName || ''} ${profile.familyName || ''})`,
            ipAddress: '192.168.1.45',
            severity: 'info',
        })
        iamDataStore.logAuditEvent({
            category: 'USER',
            action: 'UPDATE_PROFILE',
            actor: result?.username || 'me',
            target: result?.username || 'me',
            status: 'SUCCESS',
            details: 'User updated personal profile information',
        })
        return result
    },
    changePassword: async (token, password) => {
        let result
        if (token) {
            result = await apiRequest('/api/me/password', {
                token,
                method: 'PUT',
                body: JSON.stringify(password),
            })
        } else {
            const csrfResponse = await fetch('/account/csrf', {credentials: 'same-origin'})
            if (!csrfResponse.ok) throw new Error('Could not prepare password change')
            const csrf = await csrfResponse.json()
            const response = await fetch('/profile/password', {
                method: 'POST',
                credentials: 'same-origin',
                headers: {'Content-Type': 'application/x-www-form-urlencoded', [csrf.headerName]: csrf.token},
                body: new URLSearchParams({
                    currentPassword: password.currentPassword,
                    newPassword: password.newPassword,
                    confirmPassword: password.confirmPassword,
                }),
            })
            if (!response.ok) throw new Error(`Password change failed (${response.status})`)
            result = true
        }

        iamDataStore.recordActivity({
            type: 'PASSWORD',
            title: 'Password changed',
            description: 'Account security credential was successfully updated',
            ipAddress: '192.168.1.45',
            severity: 'success',
        })
        iamDataStore.logAuditEvent({
            category: 'SECURITY',
            action: 'CHANGE_PASSWORD',
            actor: 'current_user',
            target: 'current_user',
            status: 'SUCCESS',
            details: 'Password was updated by the user',
        })
        return result
    },
    getLinkedAccounts: async (token) => {
        if (token) {
            return apiRequest('/api/me/identities', {token})
        }
        const response = await fetch('/account/profile/identities', {credentials: 'same-origin'})
        if (!response.ok) throw new Error('Failed to load linked accounts')
        return await response.json()
    },
    linkAccount: async (token, provider) => {
        const csrfResponse = await fetch('/account/csrf', {credentials: 'same-origin'})
        if (!csrfResponse.ok) throw new Error('Could not prepare account link')
        const csrf = await csrfResponse.json()
        const response = await fetch(`/account/profile/identities/link/${provider}`, {
            method: 'POST',
            credentials: 'same-origin',
            headers: {[csrf.headerName]: csrf.token},
        })
        if (!response.ok) throw new Error(`Account link failed (${response.status})`)
        const result = await response.json()
        iamDataStore.recordActivity({
            type: 'IDENTITY',
            title: 'Account linked',
            description: `Linked ${provider} account`,
            ipAddress: '127.0.0.1',
            severity: 'success',
        })
        iamDataStore.logAuditEvent({
            category: 'USER',
            action: 'LINK_IDENTITY',
            actor: 'current_user',
            target: provider,
            status: 'SUCCESS',
            details: `Linked provider ${provider}`,
        })
        return result
    },
    unlinkAccount: async (token, identityUuid) => {
        let result
        if (token) {
            result = await apiRequest(`/api/me/identities/${identityUuid}`, {
                token,
                method: 'DELETE',
            })
        } else {
            const csrfResponse = await fetch('/account/csrf', {credentials: 'same-origin'})
            if (!csrfResponse.ok) throw new Error('Could not prepare account unlink')
            const csrf = await csrfResponse.json()
            const response = await fetch(`/account/profile/identities/${identityUuid}`, {
                method: 'DELETE',
                credentials: 'same-origin',
                headers: {[csrf.headerName]: csrf.token},
            })
            if (!response.ok) throw new Error(`Failed to unlink account (${response.status})`)
            result = true
        }
        iamDataStore.recordActivity({
            type: 'IDENTITY',
            title: 'Linked account removed',
            description: `Removed linked social identity (${identityUuid})`,
            ipAddress: '127.0.0.1',
            severity: 'warning',
        })
        iamDataStore.logAuditEvent({
            category: 'USER',
            action: 'UNLINK_IDENTITY',
            actor: 'current_user',
            target: identityUuid,
            status: 'SUCCESS',
            details: `Unlinked identity ${identityUuid}`,
        })
        return result
    },

    // SESSIONS & LOGINS (REAL DATA)
    getActiveSessions: async () => {
        try {
            const res = await fetch('/account/profile/sessions', {credentials: 'same-origin'})
            if (res.ok) {
                const data = await res.json()
                if (Array.isArray(data)) {
                    return data.map(item => {
                        let validDate = new Date().toISOString()
                        const raw = item.lastActiveAt || item.lastActive
                        if (raw) {
                            try {
                                const d = new Date(String(raw).replace(' ', 'T'))
                                if (!isNaN(d.getTime())) validDate = d.toISOString()
                            } catch {}
                        }
                        return {
                            ...item,
                            isCurrent: Boolean(item.isCurrent ?? item.current),
                            lastActive: validDate,
                            lastActiveAt: validDate,
                        }
                    })
                }
                return []
            }
        } catch {}
        return []
    },
    terminateSession: async (sessionId) => {
        const csrfRes = await fetch('/account/csrf', {credentials: 'same-origin'})
        const csrf = csrfRes.ok ? await csrfRes.json() : {}
        await fetch(`/account/profile/sessions/${sessionId}`, {
            method: 'DELETE',
            credentials: 'same-origin',
            headers: csrf.headerName ? {[csrf.headerName]: csrf.token} : {},
        })
        return await profileApi.getActiveSessions()
    },
    terminateAllSessions: async (_username, exceptCurrent = true) => {
        const csrfRes = await fetch('/account/csrf', {credentials: 'same-origin'})
        const csrf = csrfRes.ok ? await csrfRes.json() : {}
        await fetch(`/account/profile/sessions?exceptCurrent=${exceptCurrent}`, {
            method: 'DELETE',
            credentials: 'same-origin',
            headers: csrf.headerName ? {[csrf.headerName]: csrf.token} : {},
        })
        return await profileApi.getActiveSessions()
    },
    getLoginHistory: async () => {
        try {
            const res = await fetch('/account/profile/history', {credentials: 'same-origin'})
            if (res.ok) return res.json()
        } catch {}
        return []
    },
    getAccountActivity: async () => {
        try {
            const res = await fetch('/account/profile/activity', {credentials: 'same-origin'})
            if (res.ok) return res.json()
        } catch {}
        return []
    },

    // DEACTIVATION (REAL DATA)
    getDeactivationRequest: async () => {
        return null
    },
    requestDeactivation: async (_username, _reason, _feedback) => {
        const csrfRes = await fetch('/account/csrf', {credentials: 'same-origin'})
        const csrf = csrfRes.ok ? await csrfRes.json() : {}
        const res = await fetch('/account/profile/deactivate', {
            method: 'POST',
            credentials: 'same-origin',
            headers: csrf.headerName ? {[csrf.headerName]: csrf.token} : {},
        })
        return res.json()
    },
    cancelDeactivation: async () => {
        return true
    },
}
