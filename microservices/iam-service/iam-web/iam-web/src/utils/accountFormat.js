export const personalSections = [
    'dashboard', 'profile', 'security', 'linked', 'sessions', 'sessionManagement', 'history', 'activity', 'deactivate',
]

export const managementSections = [
    'adminOverview', 'users', 'userPermissions', 'userSessions', 'userHistory', 'roles',
]

export const accountSections = [...personalSections, ...managementSections]

export const sectionTitleKeys = {
    dashboard: 'dashboard',
    profile: 'profile', security: 'security', linked: 'linked', sessions: 'sessions',
    sessionManagement: 'sessionManagement', history: 'history', activity: 'activity', deactivate: 'deactivate',
    adminOverview: 'adminOverview', users: 'users', userRoles: 'userRoles', userPermissions: 'permissionManagement',
    userSessions: 'userSessions', userHistory: 'userHistory', roles: 'roleManagement',
}

export const sectionIcons = {
    dashboard: '▦',
    profile: '◉', security: '◇', linked: '⌁', sessions: '▣', sessionManagement: '⇄',
    history: '◷', activity: '⌁', deactivate: '⊖', adminOverview: '▦', users: '♙',
    userRoles: '♧', userPermissions: '⌑', userSessions: '▣', userHistory: '◷', roles: '♧',
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
    return new Intl.DateTimeFormat(locale === 'km' ? 'km-KH' : 'en-US', {
        month: 'short', year: 'numeric',
    }).format(new Date(value))
}

export function formatProvider(provider) {
    return `${provider || 'Social'} `.trim().replace(/\b\w/g, (character) => character.toUpperCase())
}
