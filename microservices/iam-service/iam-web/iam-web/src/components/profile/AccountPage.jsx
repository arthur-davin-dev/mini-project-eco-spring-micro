import {useEffect, useMemo, useState} from 'react'
import {ExternalLink} from 'lucide-react'
import {Alert, Toast} from '../common/Feedback'
import Sidebar from '../layout/Sidebar'
import Topbar from '../layout/Topbar'
import {useIam} from '../../hooks/useIam'
import {profileApi} from '../../features/profile/api/profileApi'
import DeactivationPage from './DeactivationPage'
import LinkedAccountsPage from './LinkedAccountsPage'
import ProfilePage from './ProfilePage'
import DashboardPage from './DashboardPage'
import SecurityPage from './SecurityPage'
import ActiveSessionsPage from './ActiveSessionsPage'
import SessionManagementPage from './SessionManagementPage'
import LoginHistoryPage from './LoginHistoryPage'
import AccountActivityPage from './AccountActivityPage'
import AdminOverviewPage from './AdminOverviewPage'
import AdminUsersPage from '../../features/admin/pages/AdminUsersPage'
import AdminRolesPage from '../../features/admin/pages/AdminRolesPage'
import AdminPermissionsPage from '../../features/admin/pages/AdminPermissionsPage'
import AdminClientsPage from '../../features/admin/pages/AdminClientsPage'
import AdminUserSessionsPage from '../../features/admin/pages/AdminUserSessionsPage'
import AdminUserLoginHistoryPage from '../../features/admin/pages/AdminUserLoginHistoryPage'
import AdminSecurityManagementPage from '../../features/admin/pages/AdminSecurityManagementPage'
import AdminAuditLogsPage from '../../features/admin/pages/AdminAuditLogsPage'
import AdminSystemConfigPage from '../../features/admin/pages/AdminSystemConfigPage'
import {accountSections, formatProvider, hasAdminRole, managementSections, sectionTitleKeys} from '../../utils/accountFormat'
import {SidebarInset, SidebarProvider} from '../ui/sidebar'

const sectionPaths = {
    dashboard: '/account',
    profile: '/profile',
    security: '/profile/security',
    linked: '/profile/linked-accounts',
    sessions: '/profile/sessions',
    sessionManagement: '/profile/session-management',
    history: '/profile/history',
    activity: '/profile/activity',
    deactivate: '/profile/deactivate',
    adminOverview: '/admin',
    users: '/admin/users',
    roles: '/admin/roles',
    permissions: '/admin/permissions',
    clients: '/admin/clients',
    userSessions: '/admin/user-sessions',
    userHistory: '/admin/user-history',
    securityManagement: '/admin/security',
    auditLogs: '/admin/audit-logs',
    systemConfig: '/admin/system-config',
}

const pathSections = {
    ...Object.fromEntries(Object.entries(sectionPaths).map(([section, path]) => [path, section])),
    '/admin/user-roles': 'roles',
    '/admin/user-permissions': 'permissions',
}

function getInitialSection(isAdmin) {
    const legacySection = new URLSearchParams(window.location.search).get('section')
    const isAdminUserDetail = /^\/admin\/users\/[^/]+$/.test(window.location.pathname)
    const isAdminRoleDetail = /^\/admin\/roles\/[^/]+$/.test(window.location.pathname)
    const section = isAdminUserDetail
        ? 'users'
        : isAdminRoleDetail
        ? 'roles'
        : pathSections[window.location.pathname] || legacySection
    if (managementSections.includes(section) && !isAdmin) return 'profile'
    return accountSections.includes(section) ? section : 'dashboard'
}

function getAdminUserId() {
    return window.location.pathname.match(/^\/admin\/users\/([^/]+)$/)?.[1] || null
}

function getAdminRoleId() {
    return window.location.pathname.match(/^\/admin\/roles\/([^/]+)$/)?.[1] || null
}

export default function AccountPage({dark, setDark}) {
    const iam = useIam()
    const {locale, setLocale, t, token, user, setUser, identities, setIdentities, clearToken, error, setError} = iam
    const isAdmin = hasAdminRole(user)
    const [page, setPage] = useState(() => getInitialSection(isAdmin))
    const [adminUserId, setAdminUserId] = useState(getAdminUserId)
    const [adminRoleId, setAdminRoleId] = useState(getAdminRoleId)
    const [working, setWorking] = useState(false)
    const [toast, setToast] = useState('')
    const roleNames = useMemo(() => (user?.roles || []).map((role) => (typeof role === 'string' ? role : role?.name)), [user])
    const pageTitle = t[sectionTitleKeys[page]] || t.profile || 'Account'

    useEffect(() => {
        const syncPage = () => {
            setPage(getInitialSection(isAdmin))
            setAdminUserId(getAdminUserId())
            setAdminRoleId(getAdminRoleId())
        }
        window.addEventListener('popstate', syncPage)
        return () => window.removeEventListener('popstate', syncPage)
    }, [isAdmin])

    useEffect(() => {
        const legacySection = new URLSearchParams(window.location.search).get('section')
        if (legacySection && sectionPaths[page]) {
            window.history.replaceState(null, '', sectionPaths[page])
        }
    }, [page])

    function navigate(section) {
        if (!accountSections.includes(section) || (managementSections.includes(section) && !isAdmin)) {
            section = 'profile'
        }
        setPage(section)
        setAdminUserId(null)
        setAdminRoleId(null)
        setError('')
        const path = sectionPaths[section] || sectionPaths.profile
        if (window.location.pathname !== path || window.location.search) {
            window.history.pushState(null, '', path)
        }
    }

    function openAdminUser(userId) {
        setPage('users')
        setAdminUserId(userId)
        setError('')
        window.history.pushState(null, '', `/admin/users/${userId}`)
    }

    function returnToAdminUsers() {
        setPage('users')
        setAdminUserId(null)
        window.history.pushState(null, '', '/admin/users')
    }

    function openAdminRole(roleId) {
        setPage('roles')
        setAdminRoleId(roleId)
        window.history.pushState(null, '', `/admin/roles/${roleId}`)
    }

    function returnToAdminRoles() {
        setPage('roles')
        setAdminRoleId(null)
        window.history.pushState(null, '', '/admin/roles')
    }

    function notify(message) {
        setToast(message)
        window.setTimeout(() => setToast(''), 3000)
    }

    async function handleSignOut() {
        clearToken()
        try {
            const csrfRes = await fetch('/account/csrf', {credentials: 'same-origin'})
            if (csrfRes.ok) {
                const csrf = await csrfRes.json()
                const form = document.createElement('form')
                form.method = 'POST'
                form.action = '/logout'
                const input = document.createElement('input')
                input.type = 'hidden'
                input.name = csrf.parameterName
                input.value = csrf.token
                form.appendChild(input)
                document.body.appendChild(form)
                form.submit()
                return
            }
        } catch (_err) {
            // Fallback to direct redirect
        }
        window.location.href = '/login?logout'
    }

    async function saveProfile(profile) {
        setWorking(true)
        setError('')
        try {
            const updated = await profileApi.updateProfile(token, profile)
            setUser(updated)
            if (updated.locale && updated.locale !== locale) setLocale(updated.locale)
            notify(t.saved || 'Profile changes saved.')
            return true
        } catch {
            setError(t.notSaved || 'Failed to save changes.')
            return false
        } finally {
            setWorking(false)
        }
    }

    async function savePassword(password) {
        if (!password.currentPassword || !password.newPassword || !password.confirmPassword) {
            setError(t.required || 'Please fill all password fields.')
            return false
        }
        if (password.newPassword !== password.confirmPassword) {
            setError(t.mismatch || 'Passwords do not match.')
            return false
        }
        setWorking(true)
        setError('')
        try {
            await profileApi.changePassword(token, password)
            notify(t.passwordSaved || 'Password changed successfully.')
            return true
        } catch {
            setError(t.notSaved || 'Password change failed.')
            return false
        } finally {
            setWorking(false)
        }
    }

    async function unlink(identity) {
        if (!window.confirm(`${t.unlink || 'Unlink'} ${identity.provider}?`)) return
        setWorking(true)
        setError('')
        try {
            await profileApi.unlinkAccount(token, identity.uuid)
            setIdentities((current) => current.filter((item) => item.uuid !== identity.uuid))
            notify(t.saved || 'Account unlinked.')
        } catch {
            setError(t.notSaved || 'Failed to unlink account.')
        } finally {
            setWorking(false)
        }
    }

    async function beginProviderLink(event, provider) {
        event?.preventDefault?.()
        setWorking(true)
        setError('')
        try {
            const provResp = await fetch('/account/providers', {credentials: 'same-origin'})
            const activeProviders = provResp.ok ? await provResp.json() : []
            if (activeProviders.includes(provider)) {
                const response = await fetch('/account/csrf', {credentials: 'same-origin'})
                if (!response.ok) throw new Error('Could not prepare secure provider link')
                const csrf = await response.json()
                const form = document.createElement('form')
                form.method = 'post'
                form.action = `/profile/accounts/link/${provider}`
                const input = document.createElement('input')
                input.type = 'hidden'
                input.name = csrf.parameterName
                input.value = csrf.token
                form.append(input)
                document.body.append(form)
                form.submit()
                return
            }

            const newIdentity = await profileApi.linkAccount(token, provider)
            setIdentities((current) => [
                ...current.filter((item) => String(item.provider).toUpperCase() !== String(provider).toUpperCase()),
                newIdentity,
            ])
            notify(`${formatProvider(provider)} connected successfully.`)
        } catch {
            setError(t.notSaved || 'Provider link failed.')
        } finally {
            setWorking(false)
        }
    }

    let content
    // Account screens
    if (page === 'dashboard') {
        content = <DashboardPage user={user} identities={identities} locale={locale} t={t} setPage={navigate} />
    } else if (page === 'profile') {
        content = (
            <ProfilePage
                user={user}
                identities={identities}
                roleNames={roleNames}
                locale={locale}
                t={t}
                working={working}
                onSave={saveProfile}
                setPage={navigate}
            />
        )
    } else if (page === 'security') {
        content = <SecurityPage t={t} locale={locale} working={working} onSave={savePassword} />
    } else if (page === 'linked') {
        content = (
            <LinkedAccountsPage
                identities={identities}
                working={working}
                t={t}
                onUnlink={unlink}
                onLink={beginProviderLink}
            />
        )
    } else if (page === 'sessions') {
        content = <ActiveSessionsPage user={user} locale={locale} t={t} setPage={navigate} />
    } else if (page === 'sessionManagement') {
        content = <SessionManagementPage user={user} locale={locale} t={t} setPage={navigate} onSignOut={handleSignOut} />
    } else if (page === 'history') {
        content = <LoginHistoryPage user={user} locale={locale} t={t} />
    } else if (page === 'activity') {
        content = <AccountActivityPage user={user} locale={locale} t={t} />
    } else if (page === 'deactivate') {
        content = <DeactivationPage user={user} locale={locale} t={t} onBack={() => navigate('profile')} />
    }
    // Management screens
    else if (page === 'adminOverview' && isAdmin) {
        content = <AdminOverviewPage token={token} locale={locale} t={t} setPage={navigate} onSelectUser={openAdminUser} />
    } else if (page === 'users' && isAdmin) {
        content = (
            <AdminUsersPage
                token={token}
                locale={locale}
                t={t}
                selectedUserId={adminUserId}
                onSelectUser={openAdminUser}
                onBack={returnToAdminUsers}
            />
        )
    } else if (page === 'roles' && isAdmin) {
        content = (
            <AdminRolesPage
                token={token}
                locale={locale}
                t={t}
                selectedRoleId={adminRoleId}
                onSelectRole={openAdminRole}
                onBack={returnToAdminRoles}
            />
        )
    } else if (page === 'permissions' && isAdmin) {
        content = <AdminPermissionsPage token={token} locale={locale} t={t} />
    } else if (page === 'clients' && isAdmin) {
        content = <AdminClientsPage locale={locale} t={t} />
    } else if (page === 'userSessions' && isAdmin) {
        content = <AdminUserSessionsPage locale={locale} t={t} />
    } else if (page === 'userHistory' && isAdmin) {
        content = <AdminUserLoginHistoryPage token={token} locale={locale} t={t} />
    } else if (page === 'securityManagement' && isAdmin) {
        content = <AdminSecurityManagementPage token={token} locale={locale} t={t} onSelectUser={openAdminUser} />
    } else if (page === 'auditLogs' && isAdmin) {
        content = <AdminAuditLogsPage locale={locale} t={t} />
    } else if (page === 'systemConfig' && isAdmin) {
        content = <AdminSystemConfigPage locale={locale} t={t} />
    } else {
        content = <DashboardPage user={user} identities={identities} locale={locale} t={t} setPage={navigate} />
    }

    return (
        <SidebarProvider className="min-h-svh bg-[var(--color-canvas)] text-[var(--color-ink)]">
            <Sidebar page={page} setPage={navigate} user={user} t={t} onSignOut={handleSignOut} />
            <SidebarInset className="min-w-0 flex-1 bg-[var(--color-canvas)]">
                <Topbar
                    pageTitle={pageTitle}
                    locale={locale}
                    setLocale={setLocale}
                    t={t}
                    user={user}
                    dark={dark}
                    setDark={setDark}
                />

                <div className="w-full max-w-none px-6 sm:px-8 pb-8 pt-6 flex-1">
                    <div className="mb-6">
                        <div className="mb-1 text-xs font-medium text-slate-400">
                            {managementSections.includes(page) ? (t.management || 'Management') : (t.account || 'Account')}
                            <span className="px-1.5">·</span>
                            {t.settings || 'Settings'}
                        </div>
                        <h1 className="m-0 text-2xl font-normal tracking-tight text-slate-900 dark:text-white">
                            {page === 'dashboard'
                                ? `${t.hello || 'Welcome'}${user?.givenName ? `, ${user.givenName}` : ''}`
                                : pageTitle}
                        </h1>
                    </div>

                    <Alert message={error} onDismiss={() => setError('')} />
                    <Toast message={toast} />

                    {content}

                    <footer className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 py-4 text-xs text-slate-400 dark:border-slate-800">
                        <span>© {new Date().getFullYear()} ISTAD Identity Platform</span>
                        <span>Multi-Tenant Enterprise IAM</span>
                        <a className="inline-flex items-center gap-1 hover:text-violet-700" href="mailto:support@istad.co">
                            Help &amp; Support <ExternalLink className="size-3" />
                        </a>
                    </footer>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
