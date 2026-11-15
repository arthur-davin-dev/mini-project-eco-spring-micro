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
    return `${user?.givenName?.[0] || user?.username?.[0] || 'A'}${user?.familyName?.[0] || ''}`.toUpperCase()
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
