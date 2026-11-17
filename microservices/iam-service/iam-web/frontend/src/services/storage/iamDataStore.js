/**
 * Persistent IAM Data Store
 * Provides local persistence and realistic default state for IAM features:
 * - Active Sessions & Session Management
 * - Login History & Suspicious Attempts
 * - Account Activity Timeline
 * - OAuth2 / OIDC Client Registry
 * - Audit Logs
 * - System Configuration
 * - Account Deactivation Requests
 */

const STORAGE_KEYS = {
    SESSIONS: 'iam_active_sessions',
    LOGIN_HISTORY: 'iam_login_history',
    ACCOUNT_ACTIVITY: 'iam_account_activity',
    OAUTH_CLIENTS: 'iam_oauth_clients',
    AUDIT_LOGS: 'iam_audit_logs',
    SYSTEM_CONFIG: 'iam_system_config',
    DEACTIVATION: 'iam_deactivation_requests',
}

const DEFAULT_SYSTEM_CONFIG = {
    authPolicies: {
        allowRegistration: true,
        requireEmailVerification: true,
        mfaMode: 'OPTIONAL', // DISABLED, OPTIONAL, REQUIRED_ADMIN, REQUIRED_ALL
        maxFailedAttempts: 5,
        lockoutDurationMinutes: 30,
        allowSocialLogin: true,
    },
    passwordPolicies: {
        minLength: 8,
        maxLength: 64,
        requireUppercase: true,
        requireLowercase: true,
        requireDigits: true,
        requireSpecialChars: true,
        expirationDays: 90,
        historyCount: 5,
    },
    sessionPolicies: {
        sessionTimeoutMinutes: 60,
        inactivityTimeoutMinutes: 30,
        maxConcurrentSessions: 3,
        singleSignOnEnabled: true,
    },
    tokenPolicies: {
        accessTokenLifetimeMinutes: 15,
        refreshTokenLifetimeDays: 30,
        idTokenLifetimeMinutes: 60,
        authorizationCodeLifetimeSeconds: 300,
    },
}

function loadStorage(key, fallback) {
    try {
        const item = localStorage.getItem(key)
        return item ? JSON.parse(item) : fallback
    } catch {
        return fallback
    }
}

function saveStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data))
    } catch (e) {
        console.error('Storage write error:', e)
    }
}

// Initial seed data generators
function getInitialSessions() {
    return [
        {
            id: 'sess-current',
            userId: 'current-user',
            username: 'admin',
            deviceType: 'desktop',
            deviceName: 'MacBook Pro 16"',
            browser: 'Chrome 122.0',
            os: 'macOS Sonoma',
            ipAddress: '192.168.1.45',
            location: 'Phnom Penh, Cambodia',
            lastActive: new Date().toISOString(),
            createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
            isCurrent: true,
        },
        {
            id: 'sess-mobile-1',
            userId: 'current-user',
            username: 'admin',
            deviceType: 'mobile',
            deviceName: 'iPhone 15 Pro',
            browser: 'Safari Mobile 17.2',
            os: 'iOS 17.3',
            ipAddress: '103.20.142.88',
            location: 'Phnom Penh, Cambodia',
            lastActive: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
            createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
            isCurrent: false,
        },
        {
            id: 'sess-work-desktop',
            userId: 'current-user',
            username: 'admin',
            deviceType: 'desktop',
            deviceName: 'Dell XPS 15 (Workstation)',
            browser: 'Firefox 123.0',
            os: 'Ubuntu 24.04 LTS',
            ipAddress: '203.0.113.195',
            location: 'Siem Reap, Cambodia',
            lastActive: new Date(Date.now() - 3600000 * 5).toISOString(),
            createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
            isCurrent: false,
        },
        {
            id: 'sess-user-chann',
            userId: 'user-chann',
            username: 'chann.rath',
            deviceType: 'desktop',
            deviceName: 'Lenovo ThinkPad X1',
            browser: 'Edge 121.0',
            os: 'Windows 11 Pro',
            ipAddress: '119.82.253.12',
            location: 'Phnom Penh, Cambodia',
            lastActive: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
            createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
            isCurrent: false,
        },
        {
            id: 'sess-user-sokha',
            userId: 'user-sokha',
            username: 'sokha.heng',
            deviceType: 'mobile',
            deviceName: 'Samsung Galaxy S24 Ultra',
            browser: 'Chrome Mobile 122.0',
            os: 'Android 14',
            ipAddress: '175.100.32.74',
            location: 'Battambang, Cambodia',
            lastActive: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
            createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
            isCurrent: false,
        },
    ]
}

function getInitialLoginHistory() {
    return [
        {
            id: 'log-1',
            username: 'admin',
            timestamp: new Date().toISOString(),
            device: 'MacBook Pro 16"',
            browser: 'Chrome 122.0',
            os: 'macOS Sonoma',
            ipAddress: '192.168.1.45',
            location: 'Phnom Penh, Cambodia',
            status: 'SUCCESS',
            authMethod: 'PASSWORD',
            reason: null,
        },
        {
            id: 'log-2',
            username: 'admin',
            timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
            device: 'iPhone 15 Pro',
            browser: 'Safari Mobile 17.2',
            os: 'iOS 17.3',
            ipAddress: '103.20.142.88',
            location: 'Phnom Penh, Cambodia',
            status: 'SUCCESS',
            authMethod: 'PASSWORD',
            reason: null,
        },
        {
            id: 'log-3',
            username: 'admin',
            timestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
            device: 'Unknown Device',
            browser: 'Chrome Headless 120.0',
            os: 'Linux x86_64',
            ipAddress: '45.154.255.91',
            location: 'Moscow, Russia',
            status: 'FAILED',
            authMethod: 'PASSWORD',
            reason: 'Invalid credentials',
            suspicious: true,
        },
        {
            id: 'log-4',
            username: 'admin',
            timestamp: new Date(Date.now() - 3600000 * 6 - 15000).toISOString(),
            device: 'Unknown Device',
            browser: 'Chrome Headless 120.0',
            os: 'Linux x86_64',
            ipAddress: '45.154.255.91',
            location: 'Moscow, Russia',
            status: 'FAILED',
            authMethod: 'PASSWORD',
            reason: 'Invalid credentials',
            suspicious: true,
        },
        {
            id: 'log-5',
            username: 'chann.rath',
            timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
            device: 'Lenovo ThinkPad X1',
            browser: 'Edge 121.0',
            os: 'Windows 11',
            ipAddress: '119.82.253.12',
            location: 'Phnom Penh, Cambodia',
            status: 'SUCCESS',
            authMethod: 'OAUTH_GOOGLE',
            reason: null,
        },
        {
            id: 'log-6',
            username: 'sokha.heng',
            timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
            device: 'Samsung Galaxy S24',
            browser: 'Chrome Mobile 122.0',
            os: 'Android 14',
            ipAddress: '175.100.32.74',
            location: 'Battambang, Cambodia',
            status: 'SUCCESS',
            authMethod: 'PASSWORD',
            reason: null,
        },
        {
            id: 'log-7',
            username: 'sokha.heng',
            timestamp: new Date(Date.now() - 3600000 * 19).toISOString(),
            device: 'Samsung Galaxy S24',
            browser: 'Chrome Mobile 122.0',
            os: 'Android 14',
            ipAddress: '175.100.32.74',
            location: 'Battambang, Cambodia',
            status: 'FAILED',
            authMethod: 'PASSWORD',
            reason: 'Mismatched password',
        },
    ]
}

function getInitialAccountActivity() {
    return [
        {
            id: 'act-1',
            type: 'SECURITY',
            title: 'Active session started',
            description: 'Signed in from Chrome on macOS in Phnom Penh',
            ipAddress: '192.168.1.45',
            timestamp: new Date().toISOString(),
            severity: 'info',
        },
        {
            id: 'act-2',
            type: 'PASSWORD',
            title: 'Password successfully changed',
            description: 'Account security credential was updated',
            ipAddress: '192.168.1.45',
            timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
            severity: 'success',
        },
        {
            id: 'act-3',
            type: 'IDENTITY',
            title: 'Social identity connected',
            description: 'Linked GitHub account (@arthurdavin)',
            ipAddress: '192.168.1.45',
            timestamp: new Date(Date.now() - 3600000 * 72).toISOString(),
            severity: 'info',
        },
        {
            id: 'act-4',
            type: 'PROFILE',
            title: 'Profile information updated',
            description: 'Phone number and preferred locale modified',
            ipAddress: '192.168.1.45',
            timestamp: new Date(Date.now() - 3600000 * 96).toISOString(),
            severity: 'info',
        },
        {
            id: 'act-5',
            type: 'SECURITY_ALERT',
            title: 'Failed sign-in attempt blocked',
            description: 'Suspicious IP address 45.154.255.91 attempted sign-in',
            ipAddress: '45.154.255.91',
            timestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
            severity: 'warning',
        },
    ]
}

function getInitialClients() {
    return [
        {
            id: 'client-eco-web',
            clientId: 'eco-web-portal',
            clientSecret: 'secret-eco-portal-2026-xyz',
            clientName: 'E-Commerce Web Portal',
            clientAuthenticationMethods: ['client_secret_basic', 'client_secret_post'],
            authorizationGrantTypes: ['authorization_code', 'refresh_token'],
            redirectUris: ['http://localhost:3000/callback', 'https://portal.istad.co/login/oauth2/code/iam'],
            postLogoutRedirectUris: ['http://localhost:3000', 'https://portal.istad.co'],
            scopes: ['openid', 'profile', 'email', 'phone'],
            requireProofKey: true,
            requireConsent: true,
            createdAt: new Date(Date.now() - 3600000 * 24 * 30).toISOString(),
            status: 'ACTIVE',
        },
        {
            id: 'client-mobile-app',
            clientId: 'eco-mobile-app',
            clientSecret: null,
            clientName: 'ISTAD Identity Mobile App',
            clientAuthenticationMethods: ['none'],
            authorizationGrantTypes: ['authorization_code', 'refresh_token'],
            redirectUris: ['istad-iam://oauth/redirect', 'https://app.istad.co/oauth2/callback'],
            postLogoutRedirectUris: ['istad-iam://logout'],
            scopes: ['openid', 'profile', 'email'],
            requireProofKey: true,
            requireConsent: false,
            createdAt: new Date(Date.now() - 3600000 * 24 * 15).toISOString(),
            status: 'ACTIVE',
        },
        {
            id: 'client-pos-system',
            clientId: 'pos-terminal-service',
            clientSecret: 'pos-secure-key-998877',
            clientName: 'POS Cashier Service',
            clientAuthenticationMethods: ['client_secret_basic'],
            authorizationGrantTypes: ['client_credentials', 'refresh_token'],
            redirectUris: ['https://pos.istad.co/auth/callback'],
            postLogoutRedirectUris: ['https://pos.istad.co'],
            scopes: ['openid', 'profile', 'read', 'write'],
            requireProofKey: false,
            requireConsent: false,
            createdAt: new Date(Date.now() - 3600000 * 24 * 7).toISOString(),
            status: 'ACTIVE',
        },
        {
            id: 'client-inventory-api',
            clientId: 'inventory-microservice',
            clientSecret: 'inventory-internal-sec-token',
            clientName: 'Inventory Microservice Daemon',
            clientAuthenticationMethods: ['client_secret_post'],
            authorizationGrantTypes: ['client_credentials'],
            redirectUris: [],
            postLogoutRedirectUris: [],
            scopes: ['openid', 'inventory:read', 'inventory:write'],
            requireProofKey: false,
            requireConsent: false,
            createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
            status: 'ACTIVE',
        },
    ]
}

function getInitialAuditLogs() {
    return [
        {
            id: 'audit-1',
            timestamp: new Date().toISOString(),
            category: 'AUTHENTICATION',
            action: 'USER_LOGIN',
            actor: 'admin',
            target: 'admin',
            status: 'SUCCESS',
            ipAddress: '192.168.1.45',
            details: 'Signed in via Web Login Form with Session Authorization',
        },
        {
            id: 'audit-2',
            timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
            category: 'ROLE',
            action: 'ASSIGN_ROLE',
            actor: 'admin',
            target: 'chann.rath',
            status: 'SUCCESS',
            ipAddress: '192.168.1.45',
            details: 'Assigned role ROLE_USER with expiration: None',
        },
        {
            id: 'audit-3',
            timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
            category: 'PERMISSION',
            action: 'GRANT_PERMISSION',
            actor: 'admin',
            target: 'sokha.heng',
            status: 'SUCCESS',
            ipAddress: '192.168.1.45',
            details: 'Granted direct permission user:read (Effect: ALLOW)',
        },
        {
            id: 'audit-4',
            timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
            category: 'CLIENT',
            action: 'REGISTER_CLIENT',
            actor: 'admin',
            target: 'pos-terminal-service',
            status: 'SUCCESS',
            ipAddress: '192.168.1.45',
            details: 'Registered new OAuth2 client POS Cashier Service',
        },
        {
            id: 'audit-5',
            timestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
            category: 'SECURITY',
            action: 'SUSPICIOUS_LOGIN_ATTEMPT',
            actor: 'anonymous',
            target: 'admin',
            status: 'FAILED',
            ipAddress: '45.154.255.91',
            details: 'Multiple failed password attempts detected from external location',
        },
        {
            id: 'audit-6',
            timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
            category: 'USER',
            action: 'CREATE_USER',
            actor: 'admin',
            target: 'chann.rath',
            status: 'SUCCESS',
            ipAddress: '192.168.1.45',
            details: 'Created new user account chann.rath (chann.rath@istad.co)',
        },
        {
            id: 'audit-7',
            timestamp: new Date(Date.now() - 3600000 * 20).toISOString(),
            category: 'CONFIG',
            action: 'UPDATE_SYSTEM_CONFIG',
            actor: 'admin',
            target: 'system_policies',
            status: 'SUCCESS',
            ipAddress: '192.168.1.45',
            details: 'Updated Password Policy: minimum length set to 8 characters',
        },
    ]
}

export const iamDataStore = {
    // SESSIONS
    getSessions: (username = 'admin') => {
        const all = loadStorage(STORAGE_KEYS.SESSIONS, getInitialSessions())
        if (!username) return all
        return all.filter((s) => s.username === username || s.userId === 'current-user')
    },
    getAllSessions: () => {
        return loadStorage(STORAGE_KEYS.SESSIONS, getInitialSessions())
    },
    terminateSession: (sessionId, actor = 'admin') => {
        const all = loadStorage(STORAGE_KEYS.SESSIONS, getInitialSessions())
        const target = all.find((s) => s.id === sessionId)
        const updated = all.filter((s) => s.id !== sessionId)
        saveStorage(STORAGE_KEYS.SESSIONS, updated)

        if (target) {
            iamDataStore.recordActivity({
                type: 'SESSION',
                title: 'Session terminated',
                description: `Terminated active session on ${target.deviceName} (${target.browser})`,
                ipAddress: target.ipAddress,
                severity: 'info',
            })
            iamDataStore.logAuditEvent({
                category: 'AUTHENTICATION',
                action: 'TERMINATE_SESSION',
                actor,
                target: target.username,
                status: 'SUCCESS',
                details: `Terminated session ${target.id} on ${target.deviceName} (${target.ipAddress})`,
            })
        }
        return updated
    },
    terminateAllSessions: (username = 'admin', exceptCurrent = true, actor = 'admin') => {
        const all = loadStorage(STORAGE_KEYS.SESSIONS, getInitialSessions())
        const updated = all.filter((s) => {
            if (s.username !== username && s.userId !== 'current-user') return true
            return exceptCurrent ? s.isCurrent : false
        })
        saveStorage(STORAGE_KEYS.SESSIONS, updated)

        iamDataStore.recordActivity({
            type: 'SESSION',
            title: 'All sessions terminated',
            description: exceptCurrent ? 'Logged out from all other active devices' : 'Logged out from all devices',
            ipAddress: '192.168.1.45',
            severity: 'warning',
        })
        iamDataStore.logAuditEvent({
            category: 'AUTHENTICATION',
            action: 'TERMINATE_ALL_SESSIONS',
            actor,
            target: username,
            status: 'SUCCESS',
            details: `Terminated all active sessions for ${username} (except current: ${exceptCurrent})`,
        })
        return updated
    },

    // LOGIN HISTORY
    getLoginHistory: (username = null) => {
        const all = loadStorage(STORAGE_KEYS.LOGIN_HISTORY, getInitialLoginHistory())
        if (!username) return all
        return all.filter((log) => log.username === username)
    },
    recordLoginAttempt: (entry) => {
        const all = loadStorage(STORAGE_KEYS.LOGIN_HISTORY, getInitialLoginHistory())
        const newEntry = {
            id: `log-${Date.now()}`,
            timestamp: new Date().toISOString(),
            ...entry,
        }
        const updated = [newEntry, ...all]
        saveStorage(STORAGE_KEYS.LOGIN_HISTORY, updated)
        return newEntry
    },

    // ACCOUNT ACTIVITY
    getAccountActivity: () => {
        return loadStorage(STORAGE_KEYS.ACCOUNT_ACTIVITY, getInitialAccountActivity())
    },
    recordActivity: (activity) => {
        const all = loadStorage(STORAGE_KEYS.ACCOUNT_ACTIVITY, getInitialAccountActivity())
        const newActivity = {
            id: `act-${Date.now()}`,
            timestamp: new Date().toISOString(),
            ...activity,
        }
        const updated = [newActivity, ...all]
        saveStorage(STORAGE_KEYS.ACCOUNT_ACTIVITY, updated)
        return newActivity
    },

    // ACCOUNT DEACTIVATION
    getDeactivationRequest: (username = 'admin') => {
        const requests = loadStorage(STORAGE_KEYS.DEACTIVATION, {})
        return requests[username] || null
    },
    requestDeactivation: (username, reason, feedback) => {
        const requests = loadStorage(STORAGE_KEYS.DEACTIVATION, {})
        const graceDays = 30
        const request = {
            username,
            reason,
            feedback,
            requestedAt: new Date().toISOString(),
            gracePeriodEndsAt: new Date(Date.now() + 3600000 * 24 * graceDays).toISOString(),
            status: 'PENDING',
        }
        requests[username] = request
        saveStorage(STORAGE_KEYS.DEACTIVATION, requests)

        iamDataStore.recordActivity({
            type: 'ACCOUNT_DEACTIVATION',
            title: 'Account deactivation requested',
            description: `Deactivation requested: ${reason}. Grace period ends in ${graceDays} days.`,
            ipAddress: '192.168.1.45',
            severity: 'warning',
        })
        iamDataStore.logAuditEvent({
            category: 'USER',
            action: 'REQUEST_DEACTIVATION',
            actor: username,
            target: username,
            status: 'SUCCESS',
            details: `User submitted deactivation request: ${reason}`,
        })
        return request
    },
    cancelDeactivation: (username) => {
        const requests = loadStorage(STORAGE_KEYS.DEACTIVATION, {})
        delete requests[username]
        saveStorage(STORAGE_KEYS.DEACTIVATION, requests)

        iamDataStore.recordActivity({
            type: 'ACCOUNT_DEACTIVATION',
            title: 'Account deactivation cancelled',
            description: 'Deactivation request was withdrawn. Account remains active.',
            ipAddress: '192.168.1.45',
            severity: 'success',
        })
        iamDataStore.logAuditEvent({
            category: 'USER',
            action: 'CANCEL_DEACTIVATION',
            actor: username,
            target: username,
            status: 'SUCCESS',
            details: `User cancelled deactivation request`,
        })
        return true
    },

    // OAUTH2 / OIDC CLIENTS
    listClients: () => {
        return loadStorage(STORAGE_KEYS.OAUTH_CLIENTS, getInitialClients())
    },
    getClient: (id) => {
        const clients = loadStorage(STORAGE_KEYS.OAUTH_CLIENTS, getInitialClients())
        return clients.find((c) => c.id === id || c.clientId === id) || null
    },
    createClient: (clientData, actor = 'admin') => {
        const clients = loadStorage(STORAGE_KEYS.OAUTH_CLIENTS, getInitialClients())
        const newClient = {
            id: `client-${Date.now()}`,
            clientId: clientData.clientId || `client-${Math.random().toString(36).substring(2, 9)}`,
            clientSecret: clientData.clientSecret || `secret-${Math.random().toString(36).substring(2, 12)}`,
            clientName: clientData.clientName,
            clientAuthenticationMethods: clientData.clientAuthenticationMethods || ['client_secret_basic'],
            authorizationGrantTypes: clientData.authorizationGrantTypes || ['authorization_code'],
            redirectUris: clientData.redirectUris || [],
            postLogoutRedirectUris: clientData.postLogoutRedirectUris || [],
            scopes: clientData.scopes || ['openid', 'profile', 'email'],
            requireProofKey: clientData.requireProofKey ?? true,
            requireConsent: clientData.requireConsent ?? true,
            createdAt: new Date().toISOString(),
            status: 'ACTIVE',
        }
        const updated = [newClient, ...clients]
        saveStorage(STORAGE_KEYS.OAUTH_CLIENTS, updated)

        iamDataStore.logAuditEvent({
            category: 'CLIENT',
            action: 'REGISTER_CLIENT',
            actor,
            target: newClient.clientId,
            status: 'SUCCESS',
            details: `Registered client: ${newClient.clientName} (${newClient.clientId})`,
        })
        return newClient
    },
    updateClient: (id, clientData, actor = 'admin') => {
        const clients = loadStorage(STORAGE_KEYS.OAUTH_CLIENTS, getInitialClients())
        const updated = clients.map((c) => (c.id === id ? {...c, ...clientData, updatedAt: new Date().toISOString()} : c))
        saveStorage(STORAGE_KEYS.OAUTH_CLIENTS, updated)

        iamDataStore.logAuditEvent({
            category: 'CLIENT',
            action: 'UPDATE_CLIENT',
            actor,
            target: clientData.clientId || id,
            status: 'SUCCESS',
            details: `Updated OAuth2 client settings`,
        })
        return updated.find((c) => c.id === id)
    },
    deleteClient: (id, actor = 'admin') => {
        const clients = loadStorage(STORAGE_KEYS.OAUTH_CLIENTS, getInitialClients())
        const target = clients.find((c) => c.id === id)
        const updated = clients.filter((c) => c.id !== id)
        saveStorage(STORAGE_KEYS.OAUTH_CLIENTS, updated)

        if (target) {
            iamDataStore.logAuditEvent({
                category: 'CLIENT',
                action: 'DELETE_CLIENT',
                actor,
                target: target.clientId,
                status: 'SUCCESS',
                details: `Deleted OAuth2 client: ${target.clientName}`,
            })
        }
        return true
    },
    regenerateClientSecret: (id, actor = 'admin') => {
        const clients = loadStorage(STORAGE_KEYS.OAUTH_CLIENTS, getInitialClients())
        const newSecret = `secret-${Math.random().toString(36).substring(2, 12)}-${Date.now().toString(36)}`
        const updated = clients.map((c) => (c.id === id ? {...c, clientSecret: newSecret} : c))
        saveStorage(STORAGE_KEYS.OAUTH_CLIENTS, updated)

        const target = clients.find((c) => c.id === id)
        if (target) {
            iamDataStore.logAuditEvent({
                category: 'CLIENT',
                action: 'REGENERATE_SECRET',
                actor,
                target: target.clientId,
                status: 'SUCCESS',
                details: `Regenerated client secret for ${target.clientName}`,
            })
        }
        return newSecret
    },

    // AUDIT LOGS
    listAuditLogs: (filters = {}) => {
        let logs = loadStorage(STORAGE_KEYS.AUDIT_LOGS, getInitialAuditLogs())
        if (filters.category && filters.category !== 'ALL') {
            logs = logs.filter((l) => l.category === filters.category)
        }
        if (filters.status && filters.status !== 'ALL') {
            logs = logs.filter((l) => l.status === filters.status)
        }
        if (filters.keyword) {
            const kw = filters.keyword.toLowerCase()
            logs = logs.filter(
                (l) =>
                    l.action?.toLowerCase().includes(kw) ||
                    l.actor?.toLowerCase().includes(kw) ||
                    l.target?.toLowerCase().includes(kw) ||
                    l.details?.toLowerCase().includes(kw) ||
                    l.ipAddress?.includes(kw)
            )
        }
        return logs
    },
    logAuditEvent: (event) => {
        const all = loadStorage(STORAGE_KEYS.AUDIT_LOGS, getInitialAuditLogs())
        const newLog = {
            id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            timestamp: new Date().toISOString(),
            ipAddress: '192.168.1.45',
            ...event,
        }
        const updated = [newLog, ...all]
        saveStorage(STORAGE_KEYS.AUDIT_LOGS, updated)
        return newLog
    },

    // SYSTEM CONFIGURATION
    getSystemConfig: () => {
        return loadStorage(STORAGE_KEYS.SYSTEM_CONFIG, DEFAULT_SYSTEM_CONFIG)
    },
    updateSystemConfig: (newConfig, actor = 'admin') => {
        saveStorage(STORAGE_KEYS.SYSTEM_CONFIG, newConfig)
        iamDataStore.logAuditEvent({
            category: 'CONFIG',
            action: 'UPDATE_SYSTEM_CONFIG',
            actor,
            target: 'system_policies',
            status: 'SUCCESS',
            details: 'System policies and token lifetimes updated',
        })
        return newConfig
    },
    resetSystemConfig: (actor = 'admin') => {
        saveStorage(STORAGE_KEYS.SYSTEM_CONFIG, DEFAULT_SYSTEM_CONFIG)
        iamDataStore.logAuditEvent({
            category: 'CONFIG',
            action: 'RESET_SYSTEM_CONFIG',
            actor,
            target: 'system_policies',
            status: 'SUCCESS',
            details: 'System configuration reset to factory defaults',
        })
        return DEFAULT_SYSTEM_CONFIG
    },
}
