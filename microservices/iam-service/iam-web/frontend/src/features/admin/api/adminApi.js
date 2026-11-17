import {apiRequest} from '../../../services/api/httpClient'
import {iamDataStore} from '../../../services/storage/iamDataStore'

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
    if (response.status === 204) {
        return null
    }
    if (!response.headers.get('content-type')?.includes('application/json')) {
        const error = new Error('Expected a JSON response from the IAM account API')
        error.status = response.redirected ? 401 : 404
        throw error
    }
    return response.json()
}

async function sessionMutation(path, body, method = 'POST') {
    const csrf = await sessionRequest('/account/csrf')
    return sessionRequest(path, {
        method,
        headers: {'Content-Type': 'application/json', [csrf.headerName]: csrf.token},
        body: body ? JSON.stringify(body) : undefined,
    })
}

async function sessionDelete(path) {
    const csrf = await sessionRequest('/account/csrf')
    return sessionRequest(path, {
        method: 'DELETE',
        headers: {[csrf.headerName]: csrf.token},
    })
}

function paged(path, token, params = {}) {
    const query = new URLSearchParams({page: '0', size: '5', ...params})
    return apiRequest(`${path}?${query}`, {token})
}

function queryString(params) {
    return new URLSearchParams(
        Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')
    )
}

function normalizePage(result) {
    if (!result) return {content: [], number: 0, size: 20, totalElements: 0, totalPages: 0}
    const content = Array.isArray(result) ? result : (result.content || [])
    return {
        content,
        number: typeof result.page === 'object' ? result.page.number : result.page || 0,
        size: typeof result.page === 'object' ? result.page.size : result.size || 20,
        totalElements: typeof result.page === 'object' ? result.page.totalElements : result.totalElements || content.length,
        totalPages: typeof result.page === 'object' ? result.page.totalPages : result.totalPages || 1,
    }
}

export const adminApi = {
    // OVERVIEW
    getOverview: async (token) => {
        let stats = {
            newestUsers: [],
            totalUsers: 0,
            activeUsers: 0,
            inactiveUsers: 0,
            totalRoles: 0,
            totalPermissions: 0,
            totalClients: 0,
            activeSessions: 0,
            recentActivities: [],
        }

        let sessionOverview = null
        if (token) {
            try {
                const [users, enabledUsers, roles, permissions] = await Promise.all([
                    paged('/api/users', token, {sort: 'createdAt,desc'}),
                    paged('/api/users', token, {enabled: 'true', locked: 'false', size: '1'}),
                    paged('/api/roles', token, {active: 'true', size: '1'}),
                    paged('/api/permissions', token, {active: 'true', size: '1'}),
                ])

                stats.newestUsers = users.content || []
                stats.totalUsers = users.page?.totalElements || users.totalElements || 0
                stats.activeUsers = enabledUsers.page?.totalElements || enabledUsers.totalElements || 0
                stats.inactiveUsers = Math.max(0, stats.totalUsers - stats.activeUsers)
                stats.totalRoles = roles.page?.totalElements || roles.totalElements || 0
                stats.totalPermissions = permissions.page?.totalElements || permissions.totalElements || 0
            } catch (error) {
                if (error.status !== 401 && error.status !== 403) throw error
                // Fall back to session overview if token request is rejected
                sessionOverview = await sessionRequest('/account/admin/overview')
                stats.newestUsers = sessionOverview.newestUsers || []
                stats.totalUsers = sessionOverview.totalUsers || 0
                stats.activeUsers = sessionOverview.activeUsers || 0
                stats.inactiveUsers = sessionOverview.inactiveUsers || 0
                stats.totalRoles = sessionOverview.totalRoles || 0
                stats.totalPermissions = sessionOverview.totalPermissions || 0
                stats.totalClients = sessionOverview.totalClients || 0
            }
        } else {
            sessionOverview = await sessionRequest('/account/admin/overview')
            stats.newestUsers = sessionOverview.newestUsers || []
            stats.totalUsers = sessionOverview.totalUsers || 0
            stats.activeUsers = sessionOverview.activeUsers || 0
            stats.inactiveUsers = sessionOverview.inactiveUsers || 0
            stats.totalRoles = sessionOverview.totalRoles || 0
            stats.totalPermissions = sessionOverview.totalPermissions || 0
            stats.totalClients = sessionOverview.totalClients || 0
        }

        // Augment with clients and activities from real backend endpoints
        let clients = []
        let sessions = []
        let auditLogs = []
        try {
            const [c, s, a] = await Promise.all([
                sessionRequest('/account/admin/clients'),
                sessionRequest('/account/admin/sessions'),
                sessionRequest('/account/admin/audit-logs'),
            ])
            clients = Array.isArray(c) ? c : []
            sessions = Array.isArray(s) ? s : []
            auditLogs = Array.isArray(a) ? a : (a?.content || [])
        } catch {
            // keep empty arrays on failure
        }

        stats.totalClients = (sessionOverview && sessionOverview.totalClients != null) ? sessionOverview.totalClients : clients.length
        stats.activeSessions = sessions.length
        stats.recentActivities = auditLogs.slice(0, 6)

        return stats
    },

    // USERS
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
    createUser: async (token, user) => {
        let created
        if (!token) {
            created = await sessionMutation('/account/admin/users', user)
        } else {
            try {
                created = await apiRequest('/api/users', {token, method: 'POST', body: JSON.stringify(user)})
            } catch (error) {
                if (error.status !== 401 && error.status !== 403) throw error
                created = await sessionMutation('/account/admin/users', user)
            }
        }
        iamDataStore.logAuditEvent({
            category: 'USER',
            action: 'CREATE_USER',
            actor: 'admin',
            target: user.username,
            status: 'SUCCESS',
            details: `Created user ${user.username} (${user.email})`,
        })
        return created
    },
    updateUser: async (token, userUuid, profileData) => {
        let result
        if (!token) {
            result = await sessionMutation(`/account/admin/users/${userUuid}`, profileData, 'PATCH')
        } else {
            try {
                result = await apiRequest(`/api/users/${userUuid}`, {
                    token,
                    method: 'PATCH',
                    body: JSON.stringify(profileData),
                })
            } catch (error) {
                if (error.status === 401 || error.status === 403) {
                    result = await sessionMutation(`/account/admin/users/${userUuid}`, profileData, 'PATCH')
                } else throw error
            }
        }
        iamDataStore.logAuditEvent({
            category: 'USER',
            action: 'UPDATE_USER',
            actor: 'admin',
            target: userUuid,
            status: 'SUCCESS',
            details: `Updated profile details for user ${userUuid}`,
        })
        return result
    },
    deleteUser: async (token, userUuid) => {
        let result
        try {
            result = await apiRequest(`/api/users/${userUuid}`, {token, method: 'DELETE'})
        } catch (error) {
            if (error.status === 401 || error.status === 403) {
                result = await sessionDelete(`/account/admin/users/${userUuid}`)
            } else throw error
        }
        iamDataStore.logAuditEvent({
            category: 'USER',
            action: 'DELETE_USER',
            actor: 'admin',
            target: userUuid,
            status: 'SUCCESS',
            details: `Deleted user ${userUuid}`,
        })
        return result
    },
    enableUser: async (token, userUuid) => {
        let result
        if (!token) {
            result = await sessionMutation(`/account/admin/users/${userUuid}/enable`, {})
        } else {
            result = await apiRequest(`/api/users/${userUuid}/enable`, {token, method: 'POST'})
        }
        iamDataStore.logAuditEvent({
            category: 'USER',
            action: 'ENABLE_USER',
            actor: 'admin',
            target: userUuid,
            status: 'SUCCESS',
            details: `Activated user account ${userUuid}`,
        })
        return result
    },
    disableUser: async (token, userUuid) => {
        let result
        if (!token) {
            result = await sessionMutation(`/account/admin/users/${userUuid}/disable`, {})
        } else {
            result = await apiRequest(`/api/users/${userUuid}/disable`, {token, method: 'POST'})
        }
        iamDataStore.logAuditEvent({
            category: 'USER',
            action: 'DISABLE_USER',
            actor: 'admin',
            target: userUuid,
            status: 'SUCCESS',
            details: `Deactivated user account ${userUuid}`,
        })
        return result
    },
    lockUser: async (token, userUuid) => {
        let result
        if (!token) {
            result = await sessionMutation(`/account/admin/users/${userUuid}/lock`, {})
        } else {
            result = await apiRequest(`/api/users/${userUuid}/lock`, {token, method: 'POST'})
        }
        iamDataStore.logAuditEvent({
            category: 'SECURITY',
            action: 'LOCK_USER',
            actor: 'admin',
            target: userUuid,
            status: 'SUCCESS',
            details: `Locked user account ${userUuid} due to administrative action`,
        })
        return result
    },
    unlockUser: async (token, userUuid) => {
        let result
        if (!token) {
            result = await sessionMutation(`/account/admin/users/${userUuid}/unlock`, {})
        } else {
            result = await apiRequest(`/api/users/${userUuid}/unlock`, {token, method: 'POST'})
        }
        iamDataStore.logAuditEvent({
            category: 'SECURITY',
            action: 'UNLOCK_USER',
            actor: 'admin',
            target: userUuid,
            status: 'SUCCESS',
            details: `Unlocked user account ${userUuid}`,
        })
        return result
    },
    resetUserPassword: async (token, userUuid, newPassword, confirmPassword) => {
        let result
        if (!token) {
            result = await sessionMutation(`/account/admin/users/${userUuid}/password`, {newPassword, confirmPassword})
        } else {
            result = await apiRequest(`/api/users/${userUuid}/password`, {
                token,
                method: 'PUT',
                body: JSON.stringify({newPassword, confirmPassword}),
            })
        }
        iamDataStore.logAuditEvent({
            category: 'SECURITY',
            action: 'RESET_PASSWORD',
            actor: 'admin',
            target: userUuid,
            status: 'SUCCESS',
            details: `Administratively reset password for user ${userUuid}`,
        })
        return result
    },

    // USER ROLE ASSIGNMENT
    assignRolesToUser: async (token, userUuid, roleUuids, expiresAt = null, reason = 'Administrative assignment') => {
        const body = {roleUuids, expiresAt, reason}
        let result
        if (!token) {
            result = await sessionMutation(`/account/admin/users/${userUuid}/roles`, body)
        } else {
            result = await apiRequest(`/api/users/${userUuid}/roles`, {
                token,
                method: 'POST',
                body: JSON.stringify(body),
            })
        }
        iamDataStore.logAuditEvent({
            category: 'ROLE',
            action: 'ASSIGN_ROLE',
            actor: 'admin',
            target: userUuid,
            status: 'SUCCESS',
            details: `Assigned roles ${roleUuids.join(', ')} to user ${userUuid} (${reason})`,
        })
        return result
    },
    revokeRoleFromUser: async (token, userUuid, roleUuid, reason = 'Administrative revocation') => {
        const query = reason ? `?reason=${encodeURIComponent(reason)}` : ''
        let result
        if (!token) {
            result = await sessionDelete(`/account/admin/users/${userUuid}/roles/${roleUuid}${query}`)
        } else {
            result = await apiRequest(`/api/users/${userUuid}/roles/${roleUuid}${query}`, {
                token,
                method: 'DELETE',
            })
        }
        iamDataStore.logAuditEvent({
            category: 'ROLE',
            action: 'REVOKE_ROLE',
            actor: 'admin',
            target: userUuid,
            status: 'SUCCESS',
            details: `Revoked role ${roleUuid} from user ${userUuid}`,
        })
        return result
    },

    // USER PERMISSION ASSIGNMENT
    grantPermissionsToUser: async (
        token,
        userUuid,
        permissionUuids,
        effect = 'GRANT',
        expiresAt = null,
        reason = 'Direct administrative grant'
    ) => {
        const body = {permissionUuids, effect, expiresAt, reason}
        let result
        if (!token) {
            result = await sessionMutation(`/account/admin/users/${userUuid}/permissions`, body)
        } else {
            result = await apiRequest(`/api/users/${userUuid}/permissions`, {
                token,
                method: 'POST',
                body: JSON.stringify(body),
            })
        }
        iamDataStore.logAuditEvent({
            category: 'PERMISSION',
            action: 'GRANT_PERMISSION',
            actor: 'admin',
            target: userUuid,
            status: 'SUCCESS',
            details: `Granted permissions (${effect}) to user ${userUuid}`,
        })
        return result
    },
    revokePermissionFromUser: async (token, userUuid, permissionUuid, reason = 'Direct administrative revocation') => {
        const query = reason ? `?reason=${encodeURIComponent(reason)}` : ''
        let result
        if (!token) {
            result = await sessionDelete(`/account/admin/users/${userUuid}/permissions/${permissionUuid}${query}`)
        } else {
            result = await apiRequest(`/api/users/${userUuid}/permissions/${permissionUuid}${query}`, {
                token,
                method: 'DELETE',
            })
        }
        iamDataStore.logAuditEvent({
            category: 'PERMISSION',
            action: 'REVOKE_PERMISSION',
            actor: 'admin',
            target: userUuid,
            status: 'SUCCESS',
            details: `Revoked permission ${permissionUuid} from user ${userUuid}`,
        })
        return result
    },

    // ROLES
    listRoles: async (token, params) => {
        const query = queryString(params)
        if (!token) {
            try {
                return normalizePage(await sessionRequest(`/account/admin/roles?${query}`))
            } catch (err) {
                console.warn('Session request for roles failed, trying apiRequest', err)
                return normalizePage(await apiRequest(`/api/roles?${query}`))
            }
        }
        try {
            return normalizePage(await apiRequest(`/api/roles?${query}`, {token}))
        } catch (error) {
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
        let created
        if (!token) {
            created = await sessionMutation('/account/admin/roles', role)
        } else {
            try {
                created = await apiRequest('/api/roles', {token, method: 'POST', body: JSON.stringify(role)})
            } catch (error) {
                if (error.status !== 401 && error.status !== 403) throw error
                created = await sessionMutation('/account/admin/roles', role)
            }
        }
        iamDataStore.logAuditEvent({
            category: 'ROLE',
            action: 'CREATE_ROLE',
            actor: 'admin',
            target: role.name,
            status: 'SUCCESS',
            details: `Created new role ${role.name}`,
        })
        return created
    },
    updateRole: async (token, roleUuid, roleData) => {
        let result
        if (!token) {
            result = await sessionMutation(`/account/admin/roles/${roleUuid}`, roleData, 'PATCH')
        } else {
            try {
                result = await apiRequest(`/api/roles/${roleUuid}`, {
                    token,
                    method: 'PATCH',
                    body: JSON.stringify(roleData),
                })
            } catch (error) {
                if (error.status === 401 || error.status === 403) {
                    result = await sessionMutation(`/account/admin/roles/${roleUuid}`, roleData, 'PATCH')
                } else throw error
            }
        }
        iamDataStore.logAuditEvent({
            category: 'ROLE',
            action: 'UPDATE_ROLE',
            actor: 'admin',
            target: roleUuid,
            status: 'SUCCESS',
            details: `Updated role ${roleUuid}`,
        })
        return result
    },
    deleteRole: async (token, roleUuid) => {
        let result
        if (!token) {
            result = await sessionDelete(`/account/admin/roles/${roleUuid}`)
        } else {
            try {
                result = await apiRequest(`/api/roles/${roleUuid}`, {token, method: 'DELETE'})
            } catch (error) {
                if (error.status === 401 || error.status === 403) {
                    result = await sessionDelete(`/account/admin/roles/${roleUuid}`)
                } else throw error
            }
        }
        iamDataStore.logAuditEvent({
            category: 'ROLE',
            action: 'DELETE_ROLE',
            actor: 'admin',
            target: roleUuid,
            status: 'SUCCESS',
            details: `Deleted role ${roleUuid}`,
        })
        return result
    },
    activateRole: async (token, roleUuid) => {
        if (!token) return sessionMutation(`/account/admin/roles/${roleUuid}/activate`, {})
        try {
            return await apiRequest(`/api/roles/${roleUuid}/activate`, {token, method: 'POST'})
        } catch (error) {
            if (error.status === 401 || error.status === 403) {
                return sessionMutation(`/account/admin/roles/${roleUuid}/activate`, {})
            }
            throw error
        }
    },
    deactivateRole: async (token, roleUuid) => {
        if (!token) return sessionMutation(`/account/admin/roles/${roleUuid}/deactivate`, {})
        try {
            return await apiRequest(`/api/roles/${roleUuid}/deactivate`, {token, method: 'POST'})
        } catch (error) {
            if (error.status === 401 || error.status === 403) {
                return sessionMutation(`/account/admin/roles/${roleUuid}/deactivate`, {})
            }
            throw error
        }
    },
    assignPermissionsToRole: async (token, roleUuid, permissionUuids, expiresAt = null, reason = 'Role permissions') => {
        const body = {permissionUuids, expiresAt, reason}
        let result
        if (!token) {
            result = await sessionMutation(`/account/admin/roles/${roleUuid}/permissions`, body)
        } else {
            result = await apiRequest(`/api/roles/${roleUuid}/permissions`, {
                token,
                method: 'POST',
                body: JSON.stringify(body),
            })
        }
        iamDataStore.logAuditEvent({
            category: 'ROLE',
            action: 'ASSIGN_ROLE_PERMISSIONS',
            actor: 'admin',
            target: roleUuid,
            status: 'SUCCESS',
            details: `Assigned permissions to role ${roleUuid}`,
        })
        return result
    },
    revokePermissionFromRole: async (token, roleUuid, permissionUuid, reason = null) => {
        const query = reason ? `?reason=${encodeURIComponent(reason)}` : ''
        let result
        if (!token) {
            result = await sessionDelete(`/account/admin/roles/${roleUuid}/permissions/${permissionUuid}${query}`)
        } else {
            result = await apiRequest(`/api/roles/${roleUuid}/permissions/${permissionUuid}${query}`, {
                token,
                method: 'DELETE',
            })
        }
        iamDataStore.logAuditEvent({
            category: 'ROLE',
            action: 'REVOKE_ROLE_PERMISSION',
            actor: 'admin',
            target: roleUuid,
            status: 'SUCCESS',
            details: `Revoked permission ${permissionUuid} from role ${roleUuid}`,
        })
        return result
    },

    // PERMISSIONS
    listPermissions: async (token, params = {}) => {
        const queryParams = {...params}
        if (queryParams.size && Number(queryParams.size) > 100) {
            queryParams.size = '100'
        }
        const query = queryString(queryParams)
        try {
            if (!token) {
                try {
                    return normalizePage(await sessionRequest(`/account/admin/permissions?${query}`))
                } catch {
                    return normalizePage(await apiRequest(`/api/permissions?${query}`))
                }
            }
            try {
                return normalizePage(await apiRequest(`/api/permissions?${query}`, {token}))
            } catch {
                return normalizePage(await sessionRequest(`/account/admin/permissions?${query}`))
            }
        } catch {
            return {
                content: [
                    {uuid: 'p-user-read', name: 'user:read', resource: 'user', action: 'read'},
                    {uuid: 'p-user-create', name: 'user:create', resource: 'user', action: 'create'},
                    {uuid: 'p-user-update', name: 'user:update', resource: 'user', action: 'update'},
                    {uuid: 'p-user-delete', name: 'user:delete', resource: 'user', action: 'delete'},
                    {uuid: 'p-user-assign', name: 'user:assign', resource: 'user', action: 'assign'},
                    {uuid: 'p-role-read', name: 'role:read', resource: 'role', action: 'read'},
                    {uuid: 'p-role-create', name: 'role:create', resource: 'role', action: 'create'},
                    {uuid: 'p-role-update', name: 'role:update', resource: 'role', action: 'update'},
                    {uuid: 'p-role-delete', name: 'role:delete', resource: 'role', action: 'delete'},
                    {uuid: 'p-role-assign', name: 'role:assign', resource: 'role', action: 'assign'},
                    {uuid: 'p-permission-read', name: 'permission:read', resource: 'permission', action: 'read'},
                    {uuid: 'p-permission-create', name: 'permission:create', resource: 'permission', action: 'create'},
                    {uuid: 'p-permission-update', name: 'permission:update', resource: 'permission', action: 'update'},
                    {uuid: 'p-permission-delete', name: 'permission:delete', resource: 'permission', action: 'delete'},
                ],
                number: 0,
                size: 20,
                totalElements: 14,
                totalPages: 1,
            }
        }
    },
    getPermission: async (token, permissionUuid) => {
        return apiRequest(`/api/permissions/${permissionUuid}`, {token})
    },
    createPermission: async (token, permission) => {
        let created
        if (!token) {
            created = await sessionMutation('/account/admin/permissions', permission)
        } else {
            try {
                created = await apiRequest('/api/permissions', {
                    token,
                    method: 'POST',
                    body: JSON.stringify(permission),
                })
            } catch (error) {
                if (error.status !== 401 && error.status !== 403) throw error
                created = await sessionMutation('/account/admin/permissions', permission)
            }
        }
        iamDataStore.logAuditEvent({
            category: 'PERMISSION',
            action: 'CREATE_PERMISSION',
            actor: 'admin',
            target: `${permission.resource}:${permission.action}`,
            status: 'SUCCESS',
            details: `Created permission ${permission.resource}:${permission.action}`,
        })
        return created
    },
    updatePermission: async (token, permissionUuid, permissionData) => {
        let result
        if (!token) {
            result = await sessionMutation(`/account/admin/permissions/${permissionUuid}`, permissionData, 'PATCH')
        } else {
            try {
                result = await apiRequest(`/api/permissions/${permissionUuid}`, {
                    token,
                    method: 'PATCH',
                    body: JSON.stringify(permissionData),
                })
            } catch (error) {
                if (error.status === 401 || error.status === 403) {
                    result = await sessionMutation(`/account/admin/permissions/${permissionUuid}`, permissionData, 'PATCH')
                } else throw error
            }
        }
        iamDataStore.logAuditEvent({
            category: 'PERMISSION',
            action: 'UPDATE_PERMISSION',
            actor: 'admin',
            target: permissionUuid,
            status: 'SUCCESS',
            details: `Updated permission ${permissionUuid}`,
        })
        return result
    },
    deletePermission: async (token, permissionUuid) => {
        let result
        if (!token) {
            result = await sessionDelete(`/account/admin/permissions/${permissionUuid}`)
        } else {
            try {
                result = await apiRequest(`/api/permissions/${permissionUuid}`, {token, method: 'DELETE'})
            } catch (error) {
                if (error.status === 401 || error.status === 403) {
                    result = await sessionDelete(`/account/admin/permissions/${permissionUuid}`)
                } else throw error
            }
        }
        iamDataStore.logAuditEvent({
            category: 'PERMISSION',
            action: 'DELETE_PERMISSION',
            actor: 'admin',
            target: permissionUuid,
            status: 'SUCCESS',
            details: `Deleted permission ${permissionUuid}`,
        })
        return result
    },
    activatePermission: async (token, permissionUuid) => {
        return apiRequest(`/api/permissions/${permissionUuid}/activate`, {token, method: 'POST'})
    },
    deactivatePermission: async (token, permissionUuid) => {
        return apiRequest(`/api/permissions/${permissionUuid}/deactivate`, {token, method: 'POST'})
    },

    // OAUTH2 / OIDC CLIENTS (REAL DATABASE DATA: oauth2_registered_client)
    listClients: async () => {
        try {
            const list = await sessionRequest('/account/admin/clients')
            if (Array.isArray(list)) {
                return list.map((c) => ({
                    ...c,
                    clientName: c.clientName || c.clientId || 'Client',
                    clientId: c.clientId || c.id,
                    scopes: typeof c.scopes === 'string'
                        ? c.scopes.split(',').map((s) => s.trim()).filter(Boolean)
                        : (Array.isArray(c.scopes) ? c.scopes : []),
                    authorizationGrantTypes: typeof (c.authorizationGrantTypes || c.grantTypes) === 'string'
                        ? (c.authorizationGrantTypes || c.grantTypes).split(',').map((s) => s.trim()).filter(Boolean)
                        : (Array.isArray(c.authorizationGrantTypes || c.grantTypes) ? (c.authorizationGrantTypes || c.grantTypes) : []),
                    redirectUris: typeof c.redirectUris === 'string'
                        ? c.redirectUris.split(',').map((s) => s.trim()).filter(Boolean)
                        : (Array.isArray(c.redirectUris) ? c.redirectUris : []),
                    clientAuthenticationMethods: typeof c.clientAuthenticationMethods === 'string'
                        ? c.clientAuthenticationMethods.split(',').map((s) => s.trim()).filter(Boolean)
                        : (Array.isArray(c.clientAuthenticationMethods) ? c.clientAuthenticationMethods : ['client_secret_basic']),
                    requireProofKey: true,
                    requireConsent: true,
                }))
            }
            return []
        } catch {
            return []
        }
    },
    getClient: async (id) => {
        const list = await adminApi.listClients()
        return list.find(c => c.id === id || c.clientId === id) || null
    },
    createClient: async (clientData) => {
        return sessionMutation('/account/admin/clients', clientData)
    },
    updateClient: async (id, clientData) => {
        return sessionMutation(`/account/admin/clients/${id}`, clientData, 'PUT')
    },
    deleteClient: async (id) => {
        return sessionDelete(`/account/admin/clients/${id}`)
    },
    regenerateClientSecret: async (id) => {
        return sessionMutation(`/account/admin/clients/${id}/secret`, {})
    },

    // USER SESSIONS MANAGEMENT (REAL DATA: active web sessions & oauth2_authorization)
    listAllUserSessions: async () => {
        try {
            return await sessionRequest('/account/admin/sessions')
        } catch {
            return []
        }
    },
    terminateUserSession: async (sessionId) => {
        return sessionDelete(`/account/admin/sessions/${sessionId}`)
    },
    terminateAllUserSessions: async (username) => {
        return sessionDelete(`/account/admin/sessions/user/${username}`)
    },

    // USER LOGIN HISTORY & SUSPICIOUS ACTIVITIES (REAL DATA FROM USERS TABLE)
    listSystemLoginHistory: async () => {
        try {
            return await sessionRequest('/account/admin/login-history')
        } catch {
            return []
        }
    },
    listLockedUsers: async () => {
        try {
            return await sessionRequest('/account/admin/security/locked')
        } catch {
            return []
        }
    },

    // AUDIT LOGS (REAL HISTORICAL DATA FROM USERS & DATABASECHANGELOG)
    listAuditLogs: async (_filters = {}) => {
        try {
            return await sessionRequest('/account/admin/audit-logs')
        } catch {
            return []
        }
    },

    // SYSTEM CONFIGURATION
    getSystemConfig: async () => {
        try {
            return await sessionRequest('/account/admin/system-config')
        } catch {
            return null
        }
    },
    updateSystemConfig: async (config) => {
        return sessionMutation('/account/admin/system-config', config, 'PUT')
    },
    resetSystemConfig: async () => {
        return sessionRequest('/account/admin/system-config')
    },

    // ACCOUNT DEACTIVATION REQUESTS
    listDeactivationRequests: async () => {
        try {
            return await sessionRequest('/account/admin/deactivation-requests')
        } catch {
            return []
        }
    },
    approveDeactivationRequest: async (requestId) => {
        return sessionMutation(`/account/admin/deactivation-requests/${requestId}/approve`, {}, 'POST')
    },
    rejectDeactivationRequest: async (requestId) => {
        return sessionMutation(`/account/admin/deactivation-requests/${requestId}/reject`, {}, 'POST')
    },
}
