export const personalSections = [
    'dashboard', 'profile', 'security', 'linked', 'sessions', 'sessionManagement', 'history', 'activity', 'deactivate',
]

export const managementSections = [
    'adminOverview',
    'users',
    'roles',
    'permissions',
    'clients',
    'userSessions',
    'userHistory',
    'securityManagement',
    'auditLogs',
    'systemConfig',
]

export const accountSections = [...personalSections, ...managementSections]

export const sectionTitleKeys = {
    dashboard: 'dashboard',
    profile: 'profile',
    security: 'security',
    linked: 'linked',
    sessions: 'sessions',
    sessionManagement: 'sessionManagement',
    history: 'history',
    activity: 'activity',
    deactivate: 'deactivate',
    adminOverview: 'adminOverview',
    users: 'users',
    userRoles: 'userRoles',
    permissions: 'permissionManagement',
    roles: 'roleManagement',
    clients: 'navClients',
    userSessions: 'userSessions',
    userHistory: 'userHistory',
    securityManagement: 'navSecurityManagement',
    auditLogs: 'navAuditLogs',
    systemConfig: 'navSystemConfig',
}

export function hasAdminRole(user) {
    return (user?.roles || []).some((role) => {
        const name = typeof role === 'string' ? role : role?.name
        return name?.toUpperCase().replace(/^ROLE_/, '') === 'ADMIN'
    })
}

export function getInitials(user) {
    if (!user) return 'U'

    // 1. If givenName and familyName exist
    const given = (user.givenName || '').trim()
    const family = (user.familyName || '').trim()
    if (given && family) {
        return `${given[0]}${family[0]}`.toUpperCase()
    }
    if (given) return given.slice(0, 2).toUpperCase()
    if (family) return family.slice(0, 2).toUpperCase()

    // 2. If single name string like "Long Sotheara", "Da Vin", "Thai Thai"
    const fullName = (user.name || '').replace(/[\(\)\[\]\{\}]/g, '').trim()
    if (fullName) {
        const parts = fullName.split(/\s+/).filter(Boolean)
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
        }
        if (parts.length === 1 && parts[0].length >= 2) {
            return parts[0].slice(0, 2).toUpperCase()
        }
        if (parts.length === 1) {
            return parts[0][0].toUpperCase()
        }
    }

    // 3. Fallback to username or email
    const username = (user.username || '').trim()
    if (username) {
        return username.slice(0, Math.min(2, username.length)).toUpperCase()
    }

    const email = (user.email || '').trim()
    if (email) {
        return email.slice(0, 2).toUpperCase()
    }

    return 'U'
}

export function formatMemberDate(value, locale) {
    if (!value) return '—'
    const d = new Date(value)
    if (isNaN(d.getTime())) return typeof value === 'string' ? value : '—'
    try {
        return new Intl.DateTimeFormat(locale === 'km' ? 'km-KH' : 'en-US', {
            month: 'short',
            year: 'numeric',
        }).format(d)
    } catch {
        return String(value)
    }
}

export function formatProvider(provider) {
    return `${provider || 'Social'} `.trim().replace(/\b\w/g, (character) => character.toUpperCase())
}
