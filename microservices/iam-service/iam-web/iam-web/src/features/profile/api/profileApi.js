import {apiRequest} from '../../../services/api/httpClient'

export const profileApi = {
    getProfile: (token) => apiRequest('/api/me', {token}),
    updateProfile: async (token, profile) => {
        if (token) {
            return apiRequest('/api/me', {
                token,
                method: 'PATCH',
                body: JSON.stringify(profile),
            })
        }

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
        return response.json()
    },
    changePassword: (token, password) => apiRequest('/api/me/password', {
        token,
        method: 'PUT',
        body: JSON.stringify(password),
    }),
    getLinkedAccounts: (token) => apiRequest('/api/me/identities', {token}),
    unlinkAccount: (token, identityUuid) => apiRequest(`/api/me/identities/${identityUuid}`, {
        token,
        method: 'DELETE',
    }),
}
