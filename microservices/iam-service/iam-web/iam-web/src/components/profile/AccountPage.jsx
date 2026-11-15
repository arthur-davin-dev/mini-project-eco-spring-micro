import {useEffect, useMemo, useState} from 'react'
import {Alert, Toast} from '../common/Feedback'
import Sidebar from '../layout/Sidebar'
import Topbar from '../layout/Topbar'
import {useIam} from '../../hooks/useIam'
import {profileApi} from '../../features/profile/api/profileApi'
import DeactivationPage from './DeactivationPage'
import LinkedAccountsPage from './LinkedAccountsPage'
import ProfilePage from './ProfilePage'
import DashboardPage from './DashboardPage'
import AdminOverviewPage from './AdminOverviewPage'
import AdminUsersPage from '../../features/admin/pages/AdminUsersPage'
import AdminRolesPage from '../../features/admin/pages/AdminRolesPage'
import AdminPermissionsPage from '../../features/admin/pages/AdminPermissionsPage'
import SecurityPage from './SecurityPage'
import UnavailableAccountPage from './UnavailableAccountPage'
import {accountSections, hasAdminRole, managementSections, sectionTitleKeys} from '../../utils/accountFormat'
import {SidebarInset, SidebarProvider} from '../ui/sidebar'

const sectionPaths = {
    dashboard: '/account', profile: '/profile', security: '/profile/security', linked: '/profile/linked-accounts',
    sessions: '/profile/sessions', sessionManagement: '/profile/session-management', history: '/profile/history',
    activity: '/profile/activity', deactivate: '/profile/deactivate', adminOverview: '/admin', users: '/admin/users',
    userRoles: '/admin/user-roles', userPermissions: '/admin/permissions', userSessions: '/admin/user-sessions',
    userHistory: '/admin/user-history', roles: '/admin/roles',
}

const pathSections = {
    ...Object.fromEntries(Object.entries(sectionPaths).map(([section, path]) => [path, section])),
    '/admin/user-roles': 'roles',
    '/admin/user-permissions': 'userPermissions',
}

function getInitialSection(isAdmin) {
    const legacySection = new URLSearchParams(window.location.search).get('section')
    const isAdminUserDetail = /^\/admin\/users\/[^/]+$/.test(window.location.pathname)
    const isAdminRoleDetail = /^\/admin\/roles\/[^/]+$/.test(window.location.pathname)
    const section = isAdminUserDetail ? 'users' : isAdminRoleDetail ? 'roles' : pathSections[window.location.pathname] || legacySection
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
    const roleNames = useMemo(() => (user?.roles || []).map((role) => role.name), [user])
    const pageTitle = t[sectionTitleKeys[page]] || t.profile
    const pageDescription = page === 'dashboard' ? t.dashboardText : page === 'profile' ? t.overview
        : page === 'security' ? t.securityText
            : page === 'linked' ? t.linkedTitle
                : page === 'users' ? adminUserId ? t.adminUserDetailIntro : t.adminUsersIntro
                    : page === 'userPermissions' ? t.adminPermissionsIntro
                        : t[`${page}Desc`] || t.unavailableText

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
        if (!accountSections.includes(section) || (managementSections.includes(section) && !isAdmin)) section = 'profile'
        setPage(section)
        setAdminUserId(null)
        setAdminRoleId(null)
        setError('')
        const path = sectionPaths[section] || sectionPaths.profile
        if (window.location.pathname !== path || window.location.search) window.history.pushState(null, '', path)
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

    async function saveProfile(profile) {
        setWorking(true)
        setError('')
        try {
            const updated = await profileApi.updateProfile(token, profile)
            setUser(updated)
            if (updated.locale && updated.locale !== locale) setLocale(updated.locale)
            notify(t.saved)
            return true
        } catch {
            setError(t.notSaved)
            return false
        } finally {
            setWorking(false)
        }
    }

    async function savePassword(password) {
        if (!password.currentPassword || !password.newPassword || !password.confirmPassword) {
            setError(t.required)
            return false
        }
        if (password.newPassword !== password.confirmPassword) {
            setError(t.mismatch)
            return false
        }
        setWorking(true)
        setError('')
        try {
            await profileApi.changePassword(token, password)
            notify(t.passwordSaved)
            return true
        } catch {
            setError(t.notSaved)
            return false
        } finally {
            setWorking(false)
        }
    }

    async function unlink(identity) {
        if (!window.confirm(`${t.unlink} ${identity.provider}?`)) return
        setWorking(true)
        setError('')
        try {
            await profileApi.unlinkAccount(token, identity.uuid)
            setIdentities((current) => current.filter((item) => item.uuid !== identity.uuid))
            notify(t.saved)
        } catch {
            setError(t.notSaved)
        } finally {
            setWorking(false)
        }
    }

    async function beginProviderLink(event, provider) {
        event.preventDefault()
        setError('')
        try {
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
        } catch {
            setError(t.notSaved)
        }
    }

    let content
    if (page === 'dashboard') content =
        <DashboardPage user={user} identities={identities} locale={locale} t={t} setPage={navigate}/>
    else if (page === 'profile') content =
        <ProfilePage user={user} identities={identities} roleNames={roleNames} locale={locale} t={t} working={working}
                     onSave={saveProfile} setPage={navigate}/>
    else if (page === 'security') content = <SecurityPage t={t} working={working} onSave={savePassword}/>
    else if (page === 'linked') content =
        <LinkedAccountsPage identities={identities} working={working} t={t} onUnlink={unlink}
                            onLink={beginProviderLink}/>
    else if (page === 'adminOverview' && isAdmin) content =
        <AdminOverviewPage token={token} locale={locale} t={t} setPage={navigate} onSelectUser={openAdminUser}/>
    else if (page === 'roles') content =
        isAdmin ? <AdminRolesPage token={token} locale={locale} t={t} selectedRoleId={adminRoleId}
                                  onSelectRole={openAdminRole} onBack={returnToAdminRoles}/> : null
    else if (page === 'userPermissions') content =
        isAdmin ? <AdminPermissionsPage token={token} t={t}/> : null
    else if (page === 'users' && isAdmin) content =
        <AdminUsersPage token={token} locale={locale} t={t} selectedUserId={adminUserId}
                        onSelectUser={openAdminUser} onBack={returnToAdminUsers}/>
    else if (page !== 'deactivate') content =
        <UnavailableAccountPage page={page} t={t} onBack={() => navigate('profile')}/>
    else content = <DeactivationPage user={user} t={t} onBack={() => navigate('profile')}/>

    return (
        <SidebarProvider className="min-h-svh bg-[var(--color-canvas)] text-[var(--color-ink)]">
            <Sidebar page={page} setPage={navigate} user={user} t={t} onSignOut={clearToken}/>
            <SidebarInset className="min-w-0 flex-1 bg-[var(--color-canvas)]">
                <Topbar pageTitle={pageTitle} locale={locale} setLocale={setLocale} t={t} user={user} dark={dark}
                        setDark={setDark}/>

                {/* Changed this container to span full width dynamically */}
                <div className="w-full max-w-none px-8 pb-6 pt-8 max-[760px]:px-4 flex-1">
                    <div className="mb-6 flex items-end justify-between gap-4">
                        <div>
                            <div className="mb-2 text-[10px] text-slate-400">{t.account} <span
                                className="px-1">·</span> {t.settings}</div>
                            <h1 className="m-0 font-[Manrope] text-2xl font-bold tracking-tight text-slate-800 dark:text-white">{page === 'dashboard' ? `${t.hello}${user.givenName ? `, ${user.givenName}` : ''}` : pageTitle}</h1>
                            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{pageDescription}</p>
                        </div>
                        <button
                            className="hidden h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50 sm:inline-flex dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                            onClick={() => setDark((value) => !value)}>
                            <span>◐</span> {t.theme}</button>
                    </div>
                    <Alert message={error} onDismiss={() => setError('')}/>
                    <Toast message={toast}/>
                    {content}
                    <footer
                        className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 py-4 text-[10px] text-slate-500 dark:border-slate-800">
                        <span>© {new Date().getFullYear()} ISTAD Identity</span><span>Secure account area</span><a
                        className="hover:text-violet-700" href="mailto:support@istad.co">Help &amp; support ↗</a>
                    </footer>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}