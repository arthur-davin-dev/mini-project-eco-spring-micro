// import {apiRequest} from '../../../services/api/httpClient'
//
// async function sessionRequest(path, options = {}) {
//     const response = await fetch(path, {credentials: 'same-origin', ...options})
//     if (!response.ok) {
//         const responseText = await response.text()
//         let problem
//         try {
//             problem = JSON.parse(responseText)
//         } catch {
//             problem = null
//         }
//         const detail = problem?.detail || problem?.message || ''
//         const error = new Error(detail || `IAM request failed (${response.status})`)
//         error.status = response.status
//         throw error
//     }
//     if (!response.headers.get('content-type')?.includes('application/json')) {
//         const error = new Error('Expected a JSON response from the IAM account API')
//         error.status = response.redirected ? 401 : 404
//         throw error
//     }
//     return response.status === 204 ? null : response.json()
// }
//
// async function sessionMutation(path, body) {
//     const csrf = await sessionRequest('/account/csrf')
//     return sessionRequest(path, {
//         method: 'POST',
//         headers: {'Content-Type': 'application/json', [csrf.headerName]: csrf.token},
//         body: JSON.stringify(body),
//     })
// }
//
// function paged(path, token, params = {}) {
//     const query = new URLSearchParams({page: '0', size: '5', ...params})
//     return apiRequest(`${path}?${query}`, {token})
// }
//
// function queryString(params) {
//     return new URLSearchParams(Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ''))
// }
//
// function normalizePage(result) {
//     return {
//         content: result.content || [],
//         number: typeof result.page === 'object' ? result.page.number : result.page || 0,
//         size: typeof result.page === 'object' ? result.page.size : result.size || 20,
//         totalElements: typeof result.page === 'object' ? result.page.totalElements : result.totalElements || 0,
//         totalPages: typeof result.page === 'object' ? result.page.totalPages : result.totalPages || 0,
//     }
// }
//
// export const adminApi = {
//     listPermissions: async (token, params) => {
//         const query = queryString(params)
//         if (!token) return normalizePage(await sessionRequest(`/account/admin/permissions?${query}`))
//         try {
//             return normalizePage(await apiRequest(`/api/permissions?${query}`, {token}))
//         } catch (error) {
//             if (error.status !== 401 && error.status !== 403) throw error
//             return normalizePage(await sessionRequest(`/account/admin/permissions?${query}`))
//         }
//     },
//     createPermission: async (token, permission) => {
//         if (!token) return sessionMutation('/account/admin/permissions', permission)
//         try {
//             return await apiRequest('/api/permissions', {token, method: 'POST', body: JSON.stringify(permission)})
//         } catch (error) {
//             if (error.status !== 401 && error.status !== 403) throw error
//             return sessionMutation('/account/admin/permissions', permission)
//         }
//     },
//     listRoles: async (token, params) => {
//         const query = queryString(params)
//         if (!token) return normalizePage(await sessionRequest(`/account/admin/roles?${query}`))
//         try {
//             return normalizePage(await apiRequest(`/api/roles?${query}`, {token}))
//         } catch (error) {
//             if (error.status !== 401 && error.status !== 403) throw error
//             return normalizePage(await sessionRequest(`/account/admin/roles?${query}`))
//         }
//     },
//     getRole: async (token, roleUuid) => {
//         if (!token) return sessionRequest(`/account/admin/roles/${roleUuid}`)
//         try {
//             return await apiRequest(`/api/roles/${roleUuid}`, {token})
//         } catch (error) {
//             if (error.status !== 401 && error.status !== 403) throw error
//             return sessionRequest(`/account/admin/roles/${roleUuid}`)
//         }
//     },
//     createRole: async (token, role) => {
//         if (!token) return sessionMutation('/account/admin/roles', role)
//         try {
//             return await apiRequest('/api/roles', {token, method: 'POST', body: JSON.stringify(role)})
//         } catch (error) {
//             if (error.status !== 401 && error.status !== 403) throw error
//             return sessionMutation('/account/admin/roles', role)
//         }
//     },
//     listUsers: async (token, params) => {
//         const query = queryString(params)
//         if (!token) return normalizePage(await sessionRequest(`/account/admin/users?${query}`))
//         try {
//             return normalizePage(await apiRequest(`/api/users?${query}`, {token}))
//         } catch (error) {
//             if (error.status !== 401 && error.status !== 403) throw error
//             return normalizePage(await sessionRequest(`/account/admin/users?${query}`))
//         }
//     },
//     getUserDetail: async (token, userUuid) => {
//         if (!token) return sessionRequest(`/account/admin/users/${userUuid}`)
//         try {
//             const [user, authorities, identities] = await Promise.all([
//                 apiRequest(`/api/users/${userUuid}`, {token}),
//                 apiRequest(`/api/users/${userUuid}/authorities`, {token}),
//                 apiRequest(`/api/users/${userUuid}/identities`, {token}),
//             ])
//             return {user, authorities, identities}
//         } catch (error) {
//             if (error.status !== 401 && error.status !== 403) throw error
//             return sessionRequest(`/account/admin/users/${userUuid}`)
//         }
//     },
//     getOverview: async (token) => {
//         if (!token) return sessionRequest('/account/admin/overview')
//         try {
//             const [users, enabledUsers, roles, permissions] = await Promise.all([
//                 paged('/api/users', token, {sort: 'createdAt,desc'}),
//                 paged('/api/users', token, {enabled: 'true', locked: 'false', size: '1'}),
//                 paged('/api/roles', token, {active: 'true', size: '1'}),
//                 paged('/api/permissions', token, {active: 'true', size: '1'}),
//             ])
//
//             return {
//                 newestUsers: users.content || [],
//                 totalUsers: users.page?.totalElements || 0,
//                 activeUsers: enabledUsers.page?.totalElements || 0,
//                 inactiveUsers: Math.max(0, (users.page?.totalElements || 0) - (enabledUsers.page?.totalElements || 0)),
//                 totalRoles: roles.page?.totalElements || 0,
//                 totalPermissions: permissions.page?.totalElements || 0,
//             }
//         } catch (error) {
//             if (error.status !== 401 && error.status !== 403) throw error
//             return sessionRequest('/account/admin/overview')
//         }
//     },
//     createUser: async (token, user) => {
//         if (!token) return sessionMutation('/account/admin/users', user)
//         try {
//             return await apiRequest('/api/users', {token, method: 'POST', body: JSON.stringify(user)})
//         } catch (error) {
//             if (error.status !== 401 && error.status !== 403) throw error
//             return sessionMutation('/account/admin/users', user)
//         }
//     },
// }


import {apiRequest} from '../../../services/api/httpClient'

async function sessionRequest(path, options = {}) {
    const response = await fetch(path, {credentials: 'same-origin', ...options})
    if (!response.ok) {
        const responseText = await response.text()
        let problem
        try {
            problem = JSON.parse(responseText)
        } catch {
            problem = null
        }
        const detail = problem?.detail || problem?.message || ''
        const error = new Error(detail || `IAM request failed (${response.status})`)
        error.status = response.status
        throw error
    }
    if (!response.headers.get('content-type')?.includes('application/json')) {
        const error = new Error('Expected a JSON response from the IAM account API')
        error.status = response.redirected ? 401 : 404
        throw error
    }
    return response.status === 204 ? null : response.json()
}

async function sessionMutation(path, body) {
    const csrf = await sessionRequest('/account/csrf')
    return sessionRequest(path, {
        method: 'POST',
        headers: {'Content-Type': 'application/json', [csrf.headerName]: csrf.token},
        body: JSON.stringify(body),
    })
}

// Added helper for DELETE session requests
async function sessionDelete(path) {
    const csrf = await sessionRequest('/account/csrf')
    return sessionRequest(path, {
        method: 'DELETE',
        headers: {[csrf.headerName]: csrf.token},
    })
}

// Added helper for PUT session requests
async function sessionPut(path, body) {
    const csrf = await sessionRequest('/account/csrf')
    return sessionRequest(path, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json', [csrf.headerName]: csrf.token},
        body: JSON.stringify(body),
    })
}

function paged(path, token, params = {}) {
    const query = new URLSearchParams({page: '0', size: '5', ...params})
    return apiRequest(`${path}?${query}`, {token})
}

function queryString(params) {
    return new URLSearchParams(Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ''))
}

function normalizePage(result) {
    return {
        content: result.content || [],
        number: typeof result.page === 'object' ? result.page.number : result.page || 0,
        size: typeof result.page === 'object' ? result.page.size : result.size || 20,
        totalElements: typeof result.page === 'object' ? result.page.totalElements : result.totalElements || 0,
        totalPages: typeof result.page === 'object' ? result.page.totalPages : result.totalPages || 0,
    }
}

export const adminApi = {
    listPermissions: async (token, params) => {
        const query = queryString(params)
        if (!token) return normalizePage(await sessionRequest(`/account/admin/permissions?${query}`))
        try {
            return normalizePage(await apiRequest(`/api/permissions?${query}`, {token}))
        } catch (error) {
            if (error.status !== 401 && error.status !== 403) throw error
            return normalizePage(await sessionRequest(`/account/admin/permissions?${query}`))
        }
    },
    createPermission: async (token, permission) => {
        if (!token) return sessionMutation('/account/admin/permissions', permission)
        try {
            return await apiRequest('/api/permissions', {token, method: 'POST', body: JSON.stringify(permission)})
        } catch (error) {
            if (error.status !== 401 && error.status !== 403) throw error
            return sessionMutation('/account/admin/permissions', permission)
        }
    },
    listRoles: async (token, params) => {
        const query = queryString(params)
        if (!token) return normalizePage(await sessionRequest(`/account/admin/roles?${query}`))
        try {
            return normalizePage(await apiRequest(`/api/roles?${query}`, {token}))
        } catch (error) {
            if (error.status !== 401 && error.status !== 403) throw error
            return normalizePage(await sessionRequest(`/account/admin/roles?${query}`))
        }
    },
    getRole: async (token, roleUuid) => {
        if (!token) return sessionRequest(`/account/admin/roles/${roleUuid}`)
        try {
            return await apiRequest(`/api/roles/${roleUuid}`, {token})
        } catch (error) {
            if (error.status !== 401 && error.status !== 403) throw error
            return sessionRequest(`/account/admin/roles/${roleUuid}`)
        }
    },
    createRole: async (token, role) => {
        if (!token) return sessionMutation('/account/admin/roles', role)
        try {
            return await apiRequest('/api/roles', {token, method: 'POST', body: JSON.stringify(role)})
        } catch (error) {
            if (error.status !== 401 && error.status !== 403) throw error
            return sessionMutation('/account/admin/roles', role)
        }
    },
    listUsers: async (token, params) => {
        const query = queryString(params)
        if (!token) return normalizePage(await sessionRequest(`/account/admin/users?${query}`))
        try {
            return normalizePage(await apiRequest(`/api/users?${query}`, {token}))
        } catch (error) {
            if (error.status !== 401 && error.status !== 403) throw error
            return normalizePage(await sessionRequest(`/account/admin/users?${query}`))
        }
    },
    getUserDetail: async (token, userUuid) => {
        if (!token) return sessionRequest(`/account/admin/users/${userUuid}`)
        try {
            const [user, authorities, identities] = await Promise.all([
                apiRequest(`/api/users/${userUuid}`, {token}),
                apiRequest(`/api/users/${userUuid}/authorities`, {token}),
                apiRequest(`/api/users/${userUuid}/identities`, {token}),
            ])
            return {user, authorities, identities}
        } catch (error) {
            if (error.status !== 401 && error.status !== 403) throw error
            return sessionRequest(`/account/admin/users/${userUuid}`)
        }
    },
    getOverview: async (token) => {
        if (!token) return sessionRequest('/account/admin/overview')
        try {
            const [users, enabledUsers, roles, permissions] = await Promise.all([
                paged('/api/users', token, {sort: 'createdAt,desc'}),
                paged('/api/users', token, {enabled: 'true', locked: 'false', size: '1'}),
                paged('/api/roles', token, {active: 'true', size: '1'}),
                paged('/api/permissions', token, {active: 'true', size: '1'}),
            ])

            return {
                newestUsers: users.content || [],
                totalUsers: users.page?.totalElements || 0,
                activeUsers: enabledUsers.page?.totalElements || 0,
                inactiveUsers: Math.max(0, (users.page?.totalElements || 0) - (enabledUsers.page?.totalElements || 0)),
                totalRoles: roles.page?.totalElements || 0,
                totalPermissions: permissions.page?.totalElements || 0,
            }
        } catch (error) {
            if (error.status !== 401 && error.status !== 403) throw error
            return sessionRequest('/account/admin/overview')
        }
    },
    createUser: async (token, user) => {
        if (!token) return sessionMutation('/account/admin/users', user)
        try {
            return await apiRequest('/api/users', {token, method: 'POST', body: JSON.stringify(user)})
        } catch (error) {
            if (error.status !== 401 && error.status !== 403) throw error
            return sessionMutation('/account/admin/users', user)
        }
    },

    // --- NEW ACTIONS (Activate, Lock, Delete, Roles, Permissions) ---

    updateUserStatus: async (token, userUuid, enabled) => {
        const body = { enabled }
        if (!token) return sessionPut(`/account/admin/users/${userUuid}/status`, body)
        try {
            return await apiRequest(`/api/users/${userUuid}/status`, {token, method: 'PUT', body: JSON.stringify(body)})
        } catch (error) {
            if (error.status !== 401 && error.status !== 403) throw error
            return sessionPut(`/account/admin/users/${userUuid}/status`, body)
        }
    },
    updateUserLock: async (token, userUuid, accountNonLocked) => {
        const body = { accountNonLocked }
        if (!token) return sessionPut(`/account/admin/users/${userUuid}/lock`, body)
        try {
            return await apiRequest(`/api/users/${userUuid}/lock`, {token, method: 'PUT', body: JSON.stringify(body)})
        } catch (error) {
            if (error.status !== 401 && error.status !== 403) throw error
            return sessionPut(`/account/admin/users/${userUuid}/lock`, body)
        }
    },
    deleteUser: async (token, userUuid) => {
        if (!token) return sessionDelete(`/account/admin/users/${userUuid}`)
        try {
            return await apiRequest(`/api/users/${userUuid}`, {token, method: 'DELETE'})
        } catch (error) {
            if (error.status !== 401 && error.status !== 403) throw error
            return sessionDelete(`/account/admin/users/${userUuid}`)
        }
    },
    assignRole: async (token, userUuid, roleUuid) => {
        if (!token) return sessionMutation(`/account/admin/users/${userUuid}/roles/${roleUuid}`, {})
        try {
            return await apiRequest(`/api/users/${userUuid}/roles/${roleUuid}`, {token, method: 'POST'})
        } catch (error) {
            if (error.status !== 401 && error.status !== 403) throw error
            return sessionMutation(`/account/admin/users/${userUuid}/roles/${roleUuid}`, {})
        }
    },
    revokeRole: async (token, userUuid, roleUuid) => {
        if (!token) return sessionDelete(`/account/admin/users/${userUuid}/roles/${roleUuid}`)
        try {
            return await apiRequest(`/api/users/${userUuid}/roles/${roleUuid}`, {token, method: 'DELETE'})
        } catch (error) {
            if (error.status !== 401 && error.status !== 403) throw error
            return sessionDelete(`/account/admin/users/${userUuid}/roles/${roleUuid}`)
        }
    },
    grantPermission: async (token, userUuid, permission) => {
        if (!token) return sessionMutation(`/account/admin/users/${userUuid}/permissions/${permission}`, {})
        try {
            return await apiRequest(`/api/users/${userUuid}/permissions/${permission}`, {token, method: 'POST'})
        } catch (error) {
            if (error.status !== 401 && error.status !== 403) throw error
            return sessionMutation(`/account/admin/users/${userUuid}/permissions/${permission}`, {})
        }
    },
    revokePermission: async (token, userUuid, permission) => {
        if (!token) return sessionDelete(`/account/admin/users/${userUuid}/permissions/${permission}`)
        try {
            return await apiRequest(`/api/users/${userUuid}/permissions/${permission}`, {token, method: 'DELETE'})
        } catch (error) {
            if (error.status !== 401 && error.status !== 403) throw error
            return sessionDelete(`/account/admin/users/${userUuid}/permissions/${permission}`)
        }
    }
}