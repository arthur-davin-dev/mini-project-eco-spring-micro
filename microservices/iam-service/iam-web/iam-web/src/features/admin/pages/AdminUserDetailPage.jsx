import {useCallback, useEffect, useState} from 'react'
import {
    ArrowLeft,
    BadgeCheck,
    CalendarDays,
    CircleAlert,
    CircleCheck,
    Edit,
    KeyRound,
    Link2,
    Lock,
    Mail,
    MinusCircle,
    PlusCircle,
    Power,
    ShieldCheck,
    Trash2,
    Unlock,
    X,
    LoaderCircle
} from 'lucide-react'
import {adminApi} from '../api/adminApi'
import Avatar from '../../../components/common/Avatar'
import {Badge} from '../../../components/ui/badge'
import {Button} from '../../../components/ui/button'
import {Card} from '../../../components/ui/card'

function dateValue(value, locale) {
    if (!value) return '—'
    return new Intl.DateTimeFormat(locale === 'km' ? 'km-KH' : 'en-US', {
        day: 'numeric', month: 'short', year: 'numeric',
    }).format(new Date(value))
}

function displayName(user) {
    return user.name || [user.givenName, user.familyName].filter(Boolean).join(' ') || user.username
}

function DetailField({label, children}) {
    return (
        <div className="min-w-0">
            <dt className="text-xs text-slate-500 dark:text-slate-400">{label}</dt>
            <dd className="mt-1 break-words text-sm font-medium text-slate-800 dark:text-slate-100">{children || '—'}</dd>
        </div>
    )
}

function TabButton({id, selected, onSelect, children}) {
    return (
        <button
            type="button"
            role="tab"
            id={`user-tab-${id}`}
            aria-selected={selected}
            aria-controls={`user-panel-${id}`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onSelect(id)}
            className={`border-b-2 px-3 py-3 text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-600 ${selected ? 'border-violet-700 font-semibold text-violet-800 dark:text-violet-300' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
        >
            {children}
        </button>
    )
}

function InfoCard({icon: Icon, label, value}) {
    return (
        <Card className="flex-row items-center gap-3 p-4 shadow-none">
            <span className="grid size-9 place-items-center rounded-lg bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                <Icon className="size-4"/>
            </span>
            <div className="min-w-0">
                <p className="text-xs text-slate-500">{label}</p>
                <p className="mt-1 truncate text-sm font-semibold">{value}</p>
            </div>
        </Card>
    )
}

// --- Dialogs for Assignments ---

function AssignRoleDialog({open, onClose, onAssigned, token, userId, t}) {
    const [dialog, setDialog] = useState(null)
    const [roles, setRoles] = useState([])
    const [selectedRole, setSelectedRole] = useState('')
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState('')

    const loadAvailableRoles = useCallback(async () => {
        try {
            const data = await adminApi.listRoles(token, { page: 0, size: 200 })
            setRoles(data.content || [])
        } catch (e) {
            console.error("Failed loading roles for assignment:", e)
            setError('Failed to load roles')
        }
    }, [token])

    useEffect(() => {
        if (open && dialog && !dialog.open) {
            dialog.showModal()
            loadAvailableRoles()
        }
        if (!open && dialog?.open) dialog.close()
    }, [open, dialog, loadAvailableRoles])

    function close() {
        setSelectedRole('')
        setError('')
        onClose()
    }

    async function submit(event) {
        event.preventDefault()
        if (!selectedRole) return
        setBusy(true)
        setError('')
        try {
            await adminApi.assignRole(token, userId, selectedRole)
            close()
            onAssigned()
        } catch (err) {
            console.error("Role assignment error:", err)
            setError(err.message || 'Failed to assign role')
        } finally {
            setBusy(false)
        }
    }

    return (
        <dialog ref={setDialog} className="fixed left-1/2 top-1/2 m-0 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-white p-0 shadow-2xl backdrop:bg-slate-950/40 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
            <form onSubmit={submit} className="grid gap-5 p-6">
                <header className="flex justify-between items-start">
                    <h2 className="text-lg font-semibold">Assign Role</h2>
                    <button type="button" onClick={close} className="text-slate-500 hover:text-slate-700"><X className="size-5"/></button>
                </header>
                {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}

                <label className="grid gap-1.5 text-sm font-medium">Select Role
                    <select
                        required
                        value={selectedRole}
                        onChange={e => setSelectedRole(e.target.value)}
                        className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none dark:border-slate-700 dark:bg-slate-950"
                    >
                        <option value="" disabled>Select a role...</option>
                        {roles.map(r => {
                            const roleId = r.uuid || r.roleUuid || r.id || r.name;
                            return <option key={roleId} value={roleId}>{r.name}</option>
                        })}
                    </select>
                </label>

                <footer className="flex justify-end gap-2 border-t border-border pt-4">
                    <Button type="button" variant="outline" onClick={close}>{t.cancel || 'Cancel'}</Button>
                    <Button type="submit" disabled={busy || !selectedRole}>
                        {busy ? <LoaderCircle className="size-4 animate-spin mr-2"/> : <PlusCircle className="size-4 mr-2"/>}
                        Assign
                    </Button>
                </footer>
            </form>
        </dialog>
    )
}

function GrantPermissionDialog({open, onClose, onGranted, token, userId, t}) {
    const [dialog, setDialog] = useState(null)
    const [permissions, setPermissions] = useState([])
    const [selectedPermission, setSelectedPermission] = useState('')
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState('')

    const loadAvailablePermissions = useCallback(async () => {
        try {
            const data = await adminApi.listPermissions(token, { page: 0, size: 500 })
            setPermissions(data.content || [])
        } catch (e) {
            console.error("Failed loading permissions for grant:", e)
            setError('Failed to load permissions')
        }
    }, [token])

    useEffect(() => {
        if (open && dialog && !dialog.open) {
            dialog.showModal()
            loadAvailablePermissions()
        }
        if (!open && dialog?.open) dialog.close()
    }, [open, dialog, loadAvailablePermissions])

    function close() {
        setSelectedPermission('')
        setError('')
        onClose()
    }

    async function submit(event) {
        event.preventDefault()
        if (!selectedPermission) return
        setBusy(true)
        setError('')
        try {
            await adminApi.grantPermission(token, userId, selectedPermission)
            close()
            onGranted()
        } catch (err) {
            console.error("Permission grant error:", err)
            setError(err.message || 'Failed to grant permission')
        } finally {
            setBusy(false)
        }
    }

    return (
        <dialog ref={setDialog} className="fixed left-1/2 top-1/2 m-0 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-white p-0 shadow-2xl backdrop:bg-slate-950/40 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
            <form onSubmit={submit} className="grid gap-5 p-6">
                <header className="flex justify-between items-start">
                    <h2 className="text-lg font-semibold">Grant Permission</h2>
                    <button type="button" onClick={close} className="text-slate-500 hover:text-slate-700"><X className="size-5"/></button>
                </header>
                {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}

                <label className="grid gap-1.5 text-sm font-medium">Select Permission
                    <select
                        required
                        value={selectedPermission}
                        onChange={e => setSelectedPermission(e.target.value)}
                        className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none dark:border-slate-700 dark:bg-slate-950"
                    >
                        <option value="" disabled>Select a permission...</option>
                        {permissions.map(p => {
                            const permId = p.uuid || p.permissionUuid || p.id || p.name;
                            return <option key={permId} value={permId}>{p.name}</option>
                        })}
                    </select>
                </label>

                <footer className="flex justify-end gap-2 border-t border-border pt-4">
                    <Button type="button" variant="outline" onClick={close}>{t.cancel || 'Cancel'}</Button>
                    <Button type="submit" disabled={busy || !selectedPermission}>
                        {busy ? <LoaderCircle className="size-4 animate-spin mr-2"/> : <PlusCircle className="size-4 mr-2"/>}
                        Grant
                    </Button>
                </footer>
            </form>
        </dialog>
    )
}

export default function AdminUserDetailPage({token, locale, t, userId, onBack}) {
    const [detail, setDetail] = useState(null)
    const [loading, setLoading] = useState(true)
    const [actioning, setActioning] = useState(false)
    const [error, setError] = useState('')
    const [tab, setTab] = useState('profile')

    // Dialog states
    const [assignRoleOpen, setAssignRoleOpen] = useState(false)
    const [grantPermissionOpen, setGrantPermissionOpen] = useState(false)

    const loadDetail = useCallback(async () => {
        setLoading(true)
        setError('')
        try {
            setDetail(await adminApi.getUserDetail(token, userId))
        } catch (requestError) {
            const message = requestError.status === 403 ? t.adminForbidden
                : requestError.status === 401 ? t.adminSessionExpired
                    : requestError.status === 404 ? t.adminUserDetailUnavailable
                        : requestError.status === 400 && (requestError.detail || requestError.message)
                            ? requestError.detail || requestError.message
                            : t.adminUserDetailError?.replace('{status}', String(requestError.status || '—')) || 'Failed to load'
            setError(message)
        } finally {
            setLoading(false)
        }
    }, [token, userId, t])

    useEffect(() => {
        const timer = window.setTimeout(loadDetail, 0)
        return () => window.clearTimeout(timer)
    }, [loadDetail])

    // --- Action Handlers ---

    async function handleToggleStatus(currentStatus) {
        if (!window.confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this account?`)) return
        setActioning(true)
        try {
            await adminApi.updateUserStatus(token, userId, !currentStatus)
            await loadDetail()
        } catch (err) {
            setError('Failed to update status')
        } finally {
            setActioning(false)
        }
    }

    async function handleToggleLock(isUnlocked) {
        if (!window.confirm(`Are you sure you want to ${isUnlocked ? 'lock' : 'unlock'} this account?`)) return
        setActioning(true)
        try {
            await adminApi.updateUserLock(token, userId, !isUnlocked)
            await loadDetail()
        } catch (err) {
            setError('Failed to update lock state')
        } finally {
            setActioning(false)
        }
    }

    async function handleDeleteUser() {
        if (!window.confirm('Are you sure you want to permanently delete this user? This cannot be undone.')) return
        setActioning(true)
        try {
            await adminApi.deleteUser(token, userId)
            onBack()
        } catch (err) {
            setError('Failed to delete user')
            setActioning(false)
        }
    }

    function handleEditProfile() {
        alert('Edit Profile Dialog triggers here')
    }

    async function handleRevokeRole(roleId) {
        if (!window.confirm('Revoke this role from the user?')) return
        setActioning(true)
        try {
            await adminApi.revokeRole(token, userId, roleId)
            await loadDetail()
        } catch (err) {
            setError('Failed to revoke role')
        } finally {
            setActioning(false)
        }
    }

    async function handleRevokePermission(permission) {
        if (!window.confirm('Revoke this permission from the user?')) return
        setActioning(true)
        try {
            await adminApi.revokePermission(token, userId, permission)
            await loadDetail()
        } catch(err) {
            setError('Failed to revoke permission')
        } finally {
            setActioning(false)
        }
    }

    // --- Renders ---

    if (loading && !detail) return (
        <div className="grid gap-5" aria-label={t.loading}>
            <div className="h-24 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800"/>
            <div className="h-24 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800"/>
            <div className="h-64 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800"/>
        </div>
    )

    if (error && !detail) return (
        <Card className="items-center gap-3 p-8 text-center shadow-none">
            <CircleAlert className="size-6 text-amber-600"/>
            <p className="max-w-lg text-sm text-slate-600 dark:text-slate-300">{error}</p>
            <div className="flex gap-2">
                <Button variant="outline" onClick={onBack}>
                    <ArrowLeft className="size-4 mr-2"/>{t.adminBackToUsers}
                </Button>
                <Button onClick={loadDetail}>{t.retry}</Button>
            </div>
        </Card>
    )

    const user = detail?.user || {}
    const authority = detail?.authorities || {}
    const assignments = authority.roles || []
    const identities = detail?.identities || []
    const permissions = Array.from(authority.effectivePermissions || [])
    const active = user.enabled && user.accountNonLocked
    const address = user.address
    const addressText = address ? [address.streetAddress, address.locality, address.region, address.postalCode, address.country].filter(Boolean).join(', ') : ''

    return (
        <div className="grid gap-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <Button variant="ghost" size="sm" className="-ml-2 mb-3 text-slate-500" onClick={onBack}>
                        <ArrowLeft className="size-4 mr-2"/>{t.adminBackToUsers || 'Back to users'}
                    </Button>
                    <div className="flex flex-wrap items-center gap-3">
                        <Avatar user={user} className="size-12 text-sm"/>
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 className="text-xl font-semibold tracking-tight">{displayName(user)}</h2>
                                <Badge variant={active ? 'success' : 'secondary'}>
                                    <span className={`size-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-slate-400'}`}/>
                                    {active ? (t.active || 'Active') : (t.inactive || 'Inactive')}
                                </Badge>
                            </div>
                            <p className="mt-1 break-all text-sm text-slate-500">
                                @{user.username} <span className="px-1">·</span>{user.email}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleEditProfile} disabled={actioning}>
                        <Edit className="size-4 mr-2"/> Edit
                    </Button>
                    <Button variant={user.enabled ? "outline" : "default"} size="sm" onClick={() => handleToggleStatus(user.enabled)} disabled={actioning}>
                        <Power className="size-4 mr-2"/> {user.enabled ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button variant={user.accountNonLocked ? "outline" : "default"} size="sm" onClick={() => handleToggleLock(user.accountNonLocked)} disabled={actioning}>
                        {user.accountNonLocked ? <Lock className="size-4 mr-2"/> : <Unlock className="size-4 mr-2"/>}
                        {user.accountNonLocked ? 'Lock' : 'Unlock'}
                    </Button>
                    <Button variant="destructive" size="sm" onClick={handleDeleteUser} disabled={actioning}>
                        <Trash2 className="size-4 mr-2"/> Delete
                    </Button>
                </div>
            </div>

            {error && (
                <div role="alert" className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
                    <CircleAlert className="size-4"/>{error}
                </div>
            )}

            <section aria-label={t.adminUserSummary} className="grid gap-3 sm:grid-cols-3">
                <InfoCard icon={CalendarDays} label={t.adminCreatedAt || 'Created'} value={dateValue(user.createdAt, locale)}/>
                <InfoCard icon={ShieldCheck} label={t.adminRolesColumn || 'Roles'} value={assignments.length}/>
                <InfoCard icon={Link2} label={t.adminLinkedAccounts || 'Linked Accounts'} value={identities.length}/>
            </section>

            <div>
                <div role="tablist" aria-label={t.adminUserSections} className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-800">
                    <TabButton id="profile" selected={tab === 'profile'} onSelect={setTab}>{t.adminProfileTab || 'Profile'}</TabButton>
                    <TabButton id="roles" selected={tab === 'roles'} onSelect={setTab}>{t.adminRolesPermissionsTab || 'Roles & Permissions'}</TabButton>
                    <TabButton id="security" selected={tab === 'security'} onSelect={setTab}>{t.adminSecurityTab || 'Security'}</TabButton>
                    <TabButton id="linked" selected={tab === 'linked'} onSelect={setTab}>{t.adminLinkedAccountsTab || 'Linked Accounts'}</TabButton>
                </div>

                <section role="tabpanel" id={`user-panel-${tab}`} aria-labelledby={`user-tab-${tab}`} className="pt-5">

                    {tab === 'profile' && (
                        <Card className="gap-0 shadow-none">
                            <header className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                                <h3 className="text-sm font-semibold">{t.adminProfileTab || 'Profile Details'}</h3>
                                <p className="mt-1 text-xs text-slate-500">{t.adminProfileDescription || 'Personal details associated with this user.'}</p>
                            </header>
                            <dl className="grid gap-x-8 gap-y-5 p-5 sm:grid-cols-2">
                                <DetailField label={t.firstName}>{user.givenName}</DetailField>
                                <DetailField label={t.lastName}>{user.familyName}</DetailField>
                                <DetailField label={t.username}>{user.username}</DetailField>
                                <DetailField label={t.email}>
                                    {user.email}
                                    {user.emailVerified && (
                                        <Badge className="ml-2" variant="success">
                                            <BadgeCheck className="size-3 mr-1"/>{t.verified || 'Verified'}
                                        </Badge>
                                    )}
                                </DetailField>
                                <DetailField label={t.nickname}>{user.nickname}</DetailField>
                                <DetailField label={t.phone}>{user.phoneNumber}</DetailField>
                                <DetailField label={t.adminGender}>{user.gender ? t[user.gender] || user.gender : null}</DetailField>
                                <DetailField label={t.adminBirthdate}>{dateValue(user.birthdate, locale)}</DetailField>
                                <DetailField label={t.language}>{user.locale === 'km' ? t.khmer : t.english}</DetailField>
                                <DetailField label={t.adminWebsite}>{user.websiteUrl}</DetailField>
                                <DetailField label={t.adminAddress}>{addressText}</DetailField>
                                <DetailField label={t.adminProfileLink}>{user.profileUrl}</DetailField>
                            </dl>
                        </Card>
                    )}

                    {tab === 'roles' && (
                        <div className="grid gap-5">
                            <Card className="gap-0 shadow-none">
                                <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                                    <h3 className="text-sm font-semibold">{t.adminAssignedRoles || 'Assigned Roles'}</h3>
                                    <Button size="sm" variant="outline" onClick={() => setAssignRoleOpen(true)} disabled={actioning}>
                                        <PlusCircle className="size-4 mr-2"/> Assign Role
                                    </Button>
                                </header>
                                {assignments.length ? (
                                    <ul className="divide-y divide-slate-100 px-5 dark:divide-slate-800">
                                        {assignments.map((role) => (
                                            <li key={role.uuid || role.roleUuid} className="flex items-center gap-3 py-4">
                                                <span className="grid size-9 place-items-center rounded-lg bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                                                    <ShieldCheck className="size-4"/>
                                                </span>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-medium">{role.name || role.roleName}</p>
                                                    <p className="mt-1 text-xs text-slate-500">
                                                        {role.expiresAt ? `${t.adminExpires}: ${dateValue(role.expiresAt, locale)}` : (t.adminNoExpiry || 'No expiry')}
                                                    </p>
                                                </div>
                                                <Badge variant="secondary">{t.adminRole || 'Role'}</Badge>
                                                <Button size="icon" variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50 ml-2" onClick={() => handleRevokeRole(role.uuid || role.roleUuid)} disabled={actioning}>
                                                    <MinusCircle className="size-4"/>
                                                </Button>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="p-5 text-sm text-slate-500">{t.adminNoRoles || 'No roles assigned.'}</p>
                                )}
                            </Card>

                            <Card className="gap-0 shadow-none">
                                <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                                    <div>
                                        <h3 className="text-sm font-semibold">{t.adminEffectivePermissions || 'Direct Permissions'}</h3>
                                        <p className="mt-1 text-xs text-slate-500">{t.adminEffectivePermissionsHint || 'Permissions directly granted to this user.'}</p>
                                    </div>
                                    <Button size="sm" variant="outline" onClick={() => setGrantPermissionOpen(true)} disabled={actioning}>
                                        <PlusCircle className="size-4 mr-2"/> Grant
                                    </Button>
                                </header>
                                {permissions.length ? (
                                    <ul className="grid gap-2 p-5 sm:grid-cols-2">
                                        {permissions.map((permission) => (
                                            <li key={permission} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800">
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                    <KeyRound className="size-4 shrink-0 text-violet-600"/>
                                                    <code className="truncate text-xs">{permission}</code>
                                                </div>
                                                <Button size="icon" variant="ghost" className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleRevokePermission(permission)} disabled={actioning}>
                                                    <MinusCircle className="size-3"/>
                                                </Button>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="p-5 text-sm text-slate-500">{t.adminNoPermissions || 'No permissions granted.'}</p>
                                )}
                            </Card>
                        </div>
                    )}

                    {tab === 'security' && (
                        <Card className="gap-0 shadow-none">
                            <header className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                                <h3 className="text-sm font-semibold">{t.adminSecurityTab || 'Security'}</h3>
                                <p className="mt-1 text-xs text-slate-500">{t.adminSecurityDescription || 'Security and login settings.'}</p>
                            </header>
                            <dl className="grid gap-5 p-5 sm:grid-cols-2">
                                <DetailField label={t.adminAccountStatus || 'Status'}>
                                    <Badge variant={active ? 'success' : 'secondary'}>
                                        <CircleCheck className="size-3 mr-1"/>{active ? (t.active || 'Active') : (t.inactive || 'Inactive')}
                                    </Badge>
                                </DetailField>
                                <DetailField label={t.verified || 'Email verified'}>{user.emailVerified ? (t.verified || 'Verified') : (t.adminNotVerified || 'Unverified')}</DetailField>
                                <DetailField label={t.adminAccountEnabled || 'Account Enabled'}>{user.enabled ? (t.yes || 'Yes') : (t.no || 'No')}</DetailField>
                                <DetailField label={t.adminLockState || 'Lock State'}>{user.accountNonLocked ? (t.adminNotLocked || 'Unlocked') : (t.adminLocked || 'Locked')}</DetailField>
                                <DetailField label={t.adminCreatedAt || 'Created'}>{dateValue(user.createdAt, locale)}</DetailField>
                                <DetailField label={t.adminUpdatedAt || 'Updated'}>{dateValue(user.updatedAt, locale)}</DetailField>
                            </dl>
                        </Card>
                    )}

                    {tab === 'linked' && (
                        <Card className="gap-0 shadow-none">
                            <header className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                                <h3 className="text-sm font-semibold">{t.adminLinkedAccountsTab || 'Linked Accounts'}</h3>
                                <p className="mt-1 text-xs text-slate-500">{t.adminLinkedAccountsHint || 'External providers connected.'}</p>
                            </header>
                            {identities.length ? (
                                <ul className="divide-y divide-slate-100 px-5 dark:divide-slate-800">
                                    {identities.map((identity) => (
                                        <li key={identity.uuid} className="flex flex-wrap items-center gap-3 py-4">
                                            <span className="grid size-9 place-items-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                                <Link2 className="size-4"/>
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium">{identity.displayName || identity.provider}</p>
                                                <p className="mt-1 text-xs text-slate-500">{identity.email || identity.provider}</p>
                                            </div>
                                            <Badge variant="success">{t.connected || 'Connected'}</Badge>
                                            <span className="w-full text-xs text-slate-500 sm:w-auto">
                                                {t.adminLinkedOn || 'Linked on'}: {dateValue(identity.linkedAt, locale)}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="grid min-h-36 place-items-center px-5 text-sm text-slate-500">
                                    <div className="text-center">
                                        <Mail className="mx-auto mb-2 size-5 text-slate-400"/>
                                        {t.adminNoLinkedAccounts || 'No linked accounts found.'}
                                    </div>
                                </div>
                            )}
                        </Card>
                    )}
                </section>
            </div>

            <AssignRoleDialog open={assignRoleOpen} onClose={() => setAssignRoleOpen(false)} onAssigned={loadDetail} token={token} userId={userId} t={t}/>
            <GrantPermissionDialog open={grantPermissionOpen} onClose={() => setGrantPermissionOpen(false)} onGranted={loadDetail} token={token} userId={userId} t={t}/>
        </div>
    )
}

// import {useCallback, useEffect, useState} from 'react'
// import {
//     ArrowLeft,
//     BadgeCheck,
//     CalendarDays,
//     CircleAlert,
//     CircleCheck,
//     Edit,
//     KeyRound,
//     Link2,
//     Lock,
//     Mail,
//     MinusCircle,
//     PlusCircle,
//     Power,
//     ShieldCheck,
//     Trash2,
//     Unlock,
//     X,
//     LoaderCircle
// } from 'lucide-react'
// import {adminApi} from '../api/adminApi'
// import Avatar from '../../../components/common/Avatar'
// import {Badge} from '../../../components/ui/badge'
// import {Button} from '../../../components/ui/button'
// import {Card} from '../../../components/ui/card'
//
// function dateValue(value, locale) {
//     if (!value) return '—'
//     return new Intl.DateTimeFormat(locale === 'km' ? 'km-KH' : 'en-US', {
//         day: 'numeric', month: 'short', year: 'numeric',
//     }).format(new Date(value))
// }
//
// function displayName(user) {
//     return user.name || [user.givenName, user.familyName].filter(Boolean).join(' ') || user.username
// }
//
// function DetailField({label, children}) {
//     return (
//         <div className="min-w-0">
//             <dt className="text-xs text-slate-500 dark:text-slate-400">{label}</dt>
//             <dd className="mt-1 break-words text-sm font-medium text-slate-800 dark:text-slate-100">{children || '—'}</dd>
//         </div>
//     )
// }
//
// function TabButton({id, selected, onSelect, children}) {
//     return (
//         <button
//             type="button"
//             role="tab"
//             id={`user-tab-${id}`}
//             aria-selected={selected}
//             aria-controls={`user-panel-${id}`}
//             tabIndex={selected ? 0 : -1}
//             onClick={() => onSelect(id)}
//             className={`border-b-2 px-3 py-3 text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-600 ${selected ? 'border-violet-700 font-semibold text-violet-800 dark:text-violet-300' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
//         >
//             {children}
//         </button>
//     )
// }
//
// function InfoCard({icon: Icon, label, value}) {
//     return (
//         <Card className="flex-row items-center gap-3 p-4 shadow-none">
//             <span className="grid size-9 place-items-center rounded-lg bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
//                 <Icon className="size-4"/>
//             </span>
//             <div className="min-w-0">
//                 <p className="text-xs text-slate-500">{label}</p>
//                 <p className="mt-1 truncate text-sm font-semibold">{value}</p>
//             </div>
//         </Card>
//     )
// }
//
// // --- New Dialogs for Assignments ---
//
// function AssignRoleDialog({open, onClose, onAssigned, token, userId, t}) {
//     const [dialog, setDialog] = useState(null)
//     const [roles, setRoles] = useState([])
//     const [selectedRole, setSelectedRole] = useState('')
//     const [busy, setBusy] = useState(false)
//     const [error, setError] = useState('')
//
//     useEffect(() => {
//         if (open && dialog && !dialog.open) {
//             dialog.showModal()
//             loadAvailableRoles()
//         }
//         if (!open && dialog?.open) dialog.close()
//     }, [open, dialog])
//
//     async function loadAvailableRoles() {
//         try {
//             // Assumes a listRoles endpoint that supports pagination/size. Adjust size as needed.
//             const data = await adminApi.listRoles(token, { page: 0, size: 100 })
//             setRoles(data.content || [])
//         } catch (e) {
//             setError('Failed to load roles')
//         }
//     }
//
//     function close() {
//         setSelectedRole('')
//         setError('')
//         onClose()
//     }
//
//     async function submit(event) {
//         event.preventDefault()
//         if (!selectedRole) return
//         setBusy(true)
//         setError('')
//         try {
//             await adminApi.assignRole(token, userId, selectedRole)
//             close()
//             onAssigned()
//         } catch (err) {
//             setError('Failed to assign role')
//         } finally {
//             setBusy(false)
//         }
//     }
//
//     return (
//         <dialog ref={setDialog} className="fixed left-1/2 top-1/2 m-0 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-white p-0 shadow-2xl backdrop:bg-slate-950/40 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
//             <form onSubmit={submit} className="grid gap-5 p-6">
//                 <header className="flex justify-between items-start">
//                     <h2 className="text-lg font-semibold">Assign Role</h2>
//                     <button type="button" onClick={close} className="text-slate-500 hover:text-slate-700"><X className="size-5"/></button>
//                 </header>
//                 {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}
//
//                 <label className="grid gap-1.5 text-sm font-medium">Select Role
//                     <select
//                         required
//                         value={selectedRole}
//                         onChange={e => setSelectedRole(e.target.value)}
//                         className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none dark:border-slate-700 dark:bg-slate-950"
//                     >
//                         <option value="" disabled>Select a role...</option>
//                         {roles.map(r => (
//                             <option key={r.uuid} value={r.uuid}>{r.name}</option>
//                         ))}
//                     </select>
//                 </label>
//
//                 <footer className="flex justify-end gap-2 border-t border-border pt-4">
//                     <Button type="button" variant="outline" onClick={close}>{t.cancel || 'Cancel'}</Button>
//                     <Button type="submit" disabled={busy || !selectedRole}>
//                         {busy ? <LoaderCircle className="size-4 animate-spin mr-2"/> : <PlusCircle className="size-4 mr-2"/>}
//                         Assign
//                     </Button>
//                 </footer>
//             </form>
//         </dialog>
//     )
// }
//
// function GrantPermissionDialog({open, onClose, onGranted, token, userId, t}) {
//     const [dialog, setDialog] = useState(null)
//     const [permissions, setPermissions] = useState([])
//     const [selectedPermission, setSelectedPermission] = useState('')
//     const [busy, setBusy] = useState(false)
//     const [error, setError] = useState('')
//
//     useEffect(() => {
//         if (open && dialog && !dialog.open) {
//             dialog.showModal()
//             loadAvailablePermissions()
//         }
//         if (!open && dialog?.open) dialog.close()
//     }, [open, dialog])
//
//     async function loadAvailablePermissions() {
//         try {
//             const data = await adminApi.listPermissions(token, { page: 0, size: 200 })
//             setPermissions(data.content || [])
//         } catch (e) {
//             setError('Failed to load permissions')
//         }
//     }
//
//     function close() {
//         setSelectedPermission('')
//         setError('')
//         onClose()
//     }
//
//     async function submit(event) {
//         event.preventDefault()
//         if (!selectedPermission) return
//         setBusy(true)
//         setError('')
//         try {
//             await adminApi.grantPermission(token, userId, selectedPermission)
//             close()
//             onGranted()
//         } catch (err) {
//             setError('Failed to grant permission')
//         } finally {
//             setBusy(false)
//         }
//     }
//
//     return (
//         <dialog ref={setDialog} className="fixed left-1/2 top-1/2 m-0 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-white p-0 shadow-2xl backdrop:bg-slate-950/40 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
//             <form onSubmit={submit} className="grid gap-5 p-6">
//                 <header className="flex justify-between items-start">
//                     <h2 className="text-lg font-semibold">Grant Permission</h2>
//                     <button type="button" onClick={close} className="text-slate-500 hover:text-slate-700"><X className="size-5"/></button>
//                 </header>
//                 {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}
//
//                 <label className="grid gap-1.5 text-sm font-medium">Select Permission
//                     <select
//                         required
//                         value={selectedPermission}
//                         onChange={e => setSelectedPermission(e.target.value)}
//                         className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none dark:border-slate-700 dark:bg-slate-950"
//                     >
//                         <option value="" disabled>Select a permission...</option>
//                         {permissions.map(p => (
//                             <option key={p.uuid || p.name} value={p.name}>{p.name}</option>
//                         ))}
//                     </select>
//                 </label>
//
//                 <footer className="flex justify-end gap-2 border-t border-border pt-4">
//                     <Button type="button" variant="outline" onClick={close}>{t.cancel || 'Cancel'}</Button>
//                     <Button type="submit" disabled={busy || !selectedPermission}>
//                         {busy ? <LoaderCircle className="size-4 animate-spin mr-2"/> : <PlusCircle className="size-4 mr-2"/>}
//                         Grant
//                     </Button>
//                 </footer>
//             </form>
//         </dialog>
//     )
// }
//
// export default function AdminUserDetailPage({token, locale, t, userId, onBack}) {
//     const [detail, setDetail] = useState(null)
//     const [loading, setLoading] = useState(true)
//     const [actioning, setActioning] = useState(false)
//     const [error, setError] = useState('')
//     const [tab, setTab] = useState('profile')
//
//     // Dialog states
//     const [assignRoleOpen, setAssignRoleOpen] = useState(false)
//     const [grantPermissionOpen, setGrantPermissionOpen] = useState(false)
//
//     const loadDetail = useCallback(async () => {
//         setLoading(true)
//         setError('')
//         try {
//             setDetail(await adminApi.getUserDetail(token, userId))
//         } catch (requestError) {
//             const message = requestError.status === 403 ? t.adminForbidden
//                 : requestError.status === 401 ? t.adminSessionExpired
//                     : requestError.status === 404 ? t.adminUserDetailUnavailable
//                         : requestError.status === 400 && (requestError.detail || requestError.message)
//                             ? requestError.detail || requestError.message
//                             : t.adminUserDetailError?.replace('{status}', String(requestError.status || '—')) || 'Failed to load'
//             setError(message)
//         } finally {
//             setLoading(false)
//         }
//     }, [token, userId, t])
//
//     useEffect(() => {
//         const timer = window.setTimeout(loadDetail, 0)
//         return () => window.clearTimeout(timer)
//     }, [loadDetail])
//
//     // --- Action Handlers ---
//
//     async function handleToggleStatus(currentStatus) {
//         if (!window.confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this account?`)) return
//         setActioning(true)
//         try {
//             await adminApi.updateUserStatus(token, userId, !currentStatus)
//             await loadDetail()
//         } catch (err) {
//             setError('Failed to update status')
//         } finally {
//             setActioning(false)
//         }
//     }
//
//     async function handleToggleLock(isUnlocked) {
//         if (!window.confirm(`Are you sure you want to ${isUnlocked ? 'lock' : 'unlock'} this account?`)) return
//         setActioning(true)
//         try {
//             await adminApi.updateUserLock(token, userId, !isUnlocked)
//             await loadDetail()
//         } catch (err) {
//             setError('Failed to update lock state')
//         } finally {
//             setActioning(false)
//         }
//     }
//
//     async function handleDeleteUser() {
//         if (!window.confirm('Are you sure you want to permanently delete this user? This cannot be undone.')) return
//         setActioning(true)
//         try {
//             await adminApi.deleteUser(token, userId)
//             onBack()
//         } catch (err) {
//             setError('Failed to delete user')
//             setActioning(false)
//         }
//     }
//
//     function handleEditProfile() {
//         alert('Edit Profile Dialog triggers here')
//     }
//
//     async function handleRevokeRole(roleId) {
//         if (!window.confirm('Revoke this role from the user?')) return
//         setActioning(true)
//         try {
//             await adminApi.revokeRole(token, userId, roleId)
//             await loadDetail()
//         } catch (err) {
//             setError('Failed to revoke role')
//         } finally {
//             setActioning(false)
//         }
//     }
//
//     async function handleRevokePermission(permission) {
//         if (!window.confirm('Revoke this permission from the user?')) return
//         setActioning(true)
//         try {
//             await adminApi.revokePermission(token, userId, permission)
//             await loadDetail()
//         } catch(err) {
//             setError('Failed to revoke permission')
//         } finally {
//             setActioning(false)
//         }
//     }
//
//     // --- Renders ---
//
//     if (loading && !detail) return (
//         <div className="grid gap-5" aria-label={t.loading}>
//             <div className="h-24 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800"/>
//             <div className="h-24 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800"/>
//             <div className="h-64 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800"/>
//         </div>
//     )
//
//     if (error && !detail) return (
//         <Card className="items-center gap-3 p-8 text-center shadow-none">
//             <CircleAlert className="size-6 text-amber-600"/>
//             <p className="max-w-lg text-sm text-slate-600 dark:text-slate-300">{error}</p>
//             <div className="flex gap-2">
//                 <Button variant="outline" onClick={onBack}>
//                     <ArrowLeft className="size-4 mr-2"/>{t.adminBackToUsers}
//                 </Button>
//                 <Button onClick={loadDetail}>{t.retry}</Button>
//             </div>
//         </Card>
//     )
//
//     const user = detail?.user || {}
//     const authority = detail?.authorities || {}
//     const assignments = authority.roles || []
//     const identities = detail?.identities || []
//     const permissions = Array.from(authority.effectivePermissions || [])
//     const active = user.enabled && user.accountNonLocked
//     const address = user.address
//     const addressText = address ? [address.streetAddress, address.locality, address.region, address.postalCode, address.country].filter(Boolean).join(', ') : ''
//
//     return (
//         <div className="grid gap-5">
//             <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
//                 <div>
//                     <Button variant="ghost" size="sm" className="-ml-2 mb-3 text-slate-500" onClick={onBack}>
//                         <ArrowLeft className="size-4 mr-2"/>{t.adminBackToUsers || 'Back to users'}
//                     </Button>
//                     <div className="flex flex-wrap items-center gap-3">
//                         <Avatar user={user} className="size-12 text-sm"/>
//                         <div className="min-w-0 flex-1">
//                             <div className="flex flex-wrap items-center gap-2">
//                                 <h2 className="text-xl font-semibold tracking-tight">{displayName(user)}</h2>
//                                 <Badge variant={active ? 'success' : 'secondary'}>
//                                     <span className={`size-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-slate-400'}`}/>
//                                     {active ? (t.active || 'Active') : (t.inactive || 'Inactive')}
//                                 </Badge>
//                             </div>
//                             <p className="mt-1 break-all text-sm text-slate-500">
//                                 @{user.username} <span className="px-1">·</span>{user.email}
//                             </p>
//                         </div>
//                     </div>
//                 </div>
//
//                 <div className="flex flex-wrap items-center gap-2">
//                     <Button variant="outline" size="sm" onClick={handleEditProfile} disabled={actioning}>
//                         <Edit className="size-4 mr-2"/> Edit
//                     </Button>
//                     <Button variant={user.enabled ? "outline" : "default"} size="sm" onClick={() => handleToggleStatus(user.enabled)} disabled={actioning}>
//                         <Power className="size-4 mr-2"/> {user.enabled ? 'Deactivate' : 'Activate'}
//                     </Button>
//                     <Button variant={user.accountNonLocked ? "outline" : "default"} size="sm" onClick={() => handleToggleLock(user.accountNonLocked)} disabled={actioning}>
//                         {user.accountNonLocked ? <Lock className="size-4 mr-2"/> : <Unlock className="size-4 mr-2"/>}
//                         {user.accountNonLocked ? 'Lock' : 'Unlock'}
//                     </Button>
//                     <Button variant="destructive" size="sm" onClick={handleDeleteUser} disabled={actioning}>
//                         <Trash2 className="size-4 mr-2"/> Delete
//                     </Button>
//                 </div>
//             </div>
//
//             {error && (
//                 <div role="alert" className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
//                     <CircleAlert className="size-4"/>{error}
//                 </div>
//             )}
//
//             <section aria-label={t.adminUserSummary} className="grid gap-3 sm:grid-cols-3">
//                 <InfoCard icon={CalendarDays} label={t.adminCreatedAt || 'Created'} value={dateValue(user.createdAt, locale)}/>
//                 <InfoCard icon={ShieldCheck} label={t.adminRolesColumn || 'Roles'} value={assignments.length}/>
//                 <InfoCard icon={Link2} label={t.adminLinkedAccounts || 'Linked Accounts'} value={identities.length}/>
//             </section>
//
//             <div>
//                 <div role="tablist" aria-label={t.adminUserSections} className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-800">
//                     <TabButton id="profile" selected={tab === 'profile'} onSelect={setTab}>{t.adminProfileTab || 'Profile'}</TabButton>
//                     <TabButton id="roles" selected={tab === 'roles'} onSelect={setTab}>{t.adminRolesPermissionsTab || 'Roles & Permissions'}</TabButton>
//                     <TabButton id="security" selected={tab === 'security'} onSelect={setTab}>{t.adminSecurityTab || 'Security'}</TabButton>
//                     <TabButton id="linked" selected={tab === 'linked'} onSelect={setTab}>{t.adminLinkedAccountsTab || 'Linked Accounts'}</TabButton>
//                 </div>
//
//                 <section role="tabpanel" id={`user-panel-${tab}`} aria-labelledby={`user-tab-${tab}`} className="pt-5">
//
//                     {tab === 'profile' && (
//                         <Card className="gap-0 shadow-none">
//                             <header className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
//                                 <h3 className="text-sm font-semibold">{t.adminProfileTab || 'Profile Details'}</h3>
//                                 <p className="mt-1 text-xs text-slate-500">{t.adminProfileDescription || 'Personal details associated with this user.'}</p>
//                             </header>
//                             <dl className="grid gap-x-8 gap-y-5 p-5 sm:grid-cols-2">
//                                 <DetailField label={t.firstName}>{user.givenName}</DetailField>
//                                 <DetailField label={t.lastName}>{user.familyName}</DetailField>
//                                 <DetailField label={t.username}>{user.username}</DetailField>
//                                 <DetailField label={t.email}>
//                                     {user.email}
//                                     {user.emailVerified && (
//                                         <Badge className="ml-2" variant="success">
//                                             <BadgeCheck className="size-3 mr-1"/>{t.verified || 'Verified'}
//                                         </Badge>
//                                     )}
//                                 </DetailField>
//                                 <DetailField label={t.nickname}>{user.nickname}</DetailField>
//                                 <DetailField label={t.phone}>{user.phoneNumber}</DetailField>
//                                 <DetailField label={t.adminGender}>{user.gender ? t[user.gender] || user.gender : null}</DetailField>
//                                 <DetailField label={t.adminBirthdate}>{dateValue(user.birthdate, locale)}</DetailField>
//                                 <DetailField label={t.language}>{user.locale === 'km' ? t.khmer : t.english}</DetailField>
//                                 <DetailField label={t.adminWebsite}>{user.websiteUrl}</DetailField>
//                                 <DetailField label={t.adminAddress}>{addressText}</DetailField>
//                                 <DetailField label={t.adminProfileLink}>{user.profileUrl}</DetailField>
//                             </dl>
//                         </Card>
//                     )}
//
//                     {tab === 'roles' && (
//                         <div className="grid gap-5">
//                             <Card className="gap-0 shadow-none">
//                                 <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
//                                     <h3 className="text-sm font-semibold">{t.adminAssignedRoles || 'Assigned Roles'}</h3>
//                                     <Button size="sm" variant="outline" onClick={() => setAssignRoleOpen(true)} disabled={actioning}>
//                                         <PlusCircle className="size-4 mr-2"/> Assign Role
//                                     </Button>
//                                 </header>
//                                 {assignments.length ? (
//                                     <ul className="divide-y divide-slate-100 px-5 dark:divide-slate-800">
//                                         {assignments.map((role) => (
//                                             <li key={role.uuid || role.roleUuid} className="flex items-center gap-3 py-4">
//                                                 <span className="grid size-9 place-items-center rounded-lg bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
//                                                     <ShieldCheck className="size-4"/>
//                                                 </span>
//                                                 <div className="min-w-0 flex-1">
//                                                     <p className="text-sm font-medium">{role.name || role.roleName}</p>
//                                                     <p className="mt-1 text-xs text-slate-500">
//                                                         {role.expiresAt ? `${t.adminExpires}: ${dateValue(role.expiresAt, locale)}` : (t.adminNoExpiry || 'No expiry')}
//                                                     </p>
//                                                 </div>
//                                                 <Badge variant="secondary">{t.adminRole || 'Role'}</Badge>
//                                                 <Button size="icon" variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50 ml-2" onClick={() => handleRevokeRole(role.uuid || role.roleUuid)} disabled={actioning}>
//                                                     <MinusCircle className="size-4"/>
//                                                 </Button>
//                                             </li>
//                                         ))}
//                                     </ul>
//                                 ) : (
//                                     <p className="p-5 text-sm text-slate-500">{t.adminNoRoles || 'No roles assigned.'}</p>
//                                 )}
//                             </Card>
//
//                             <Card className="gap-0 shadow-none">
//                                 <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
//                                     <div>
//                                         <h3 className="text-sm font-semibold">{t.adminEffectivePermissions || 'Direct Permissions'}</h3>
//                                         <p className="mt-1 text-xs text-slate-500">{t.adminEffectivePermissionsHint || 'Permissions directly granted to this user.'}</p>
//                                     </div>
//                                     <Button size="sm" variant="outline" onClick={() => setGrantPermissionOpen(true)} disabled={actioning}>
//                                         <PlusCircle className="size-4 mr-2"/> Grant
//                                     </Button>
//                                 </header>
//                                 {permissions.length ? (
//                                     <ul className="grid gap-2 p-5 sm:grid-cols-2">
//                                         {permissions.map((permission) => (
//                                             <li key={permission} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800">
//                                                 <div className="flex items-center gap-2 overflow-hidden">
//                                                     <KeyRound className="size-4 shrink-0 text-violet-600"/>
//                                                     <code className="truncate text-xs">{permission}</code>
//                                                 </div>
//                                                 <Button size="icon" variant="ghost" className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleRevokePermission(permission)} disabled={actioning}>
//                                                     <MinusCircle className="size-3"/>
//                                                 </Button>
//                                             </li>
//                                         ))}
//                                     </ul>
//                                 ) : (
//                                     <p className="p-5 text-sm text-slate-500">{t.adminNoPermissions || 'No permissions granted.'}</p>
//                                 )}
//                             </Card>
//                         </div>
//                     )}
//
//                     {tab === 'security' && (
//                         <Card className="gap-0 shadow-none">
//                             <header className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
//                                 <h3 className="text-sm font-semibold">{t.adminSecurityTab || 'Security'}</h3>
//                                 <p className="mt-1 text-xs text-slate-500">{t.adminSecurityDescription || 'Security and login settings.'}</p>
//                             </header>
//                             <dl className="grid gap-5 p-5 sm:grid-cols-2">
//                                 <DetailField label={t.adminAccountStatus || 'Status'}>
//                                     <Badge variant={active ? 'success' : 'secondary'}>
//                                         <CircleCheck className="size-3 mr-1"/>{active ? (t.active || 'Active') : (t.inactive || 'Inactive')}
//                                     </Badge>
//                                 </DetailField>
//                                 <DetailField label={t.verified || 'Email verified'}>{user.emailVerified ? (t.verified || 'Verified') : (t.adminNotVerified || 'Unverified')}</DetailField>
//                                 <DetailField label={t.adminAccountEnabled || 'Account Enabled'}>{user.enabled ? (t.yes || 'Yes') : (t.no || 'No')}</DetailField>
//                                 <DetailField label={t.adminLockState || 'Lock State'}>{user.accountNonLocked ? (t.adminNotLocked || 'Unlocked') : (t.adminLocked || 'Locked')}</DetailField>
//                                 <DetailField label={t.adminCreatedAt || 'Created'}>{dateValue(user.createdAt, locale)}</DetailField>
//                                 <DetailField label={t.adminUpdatedAt || 'Updated'}>{dateValue(user.updatedAt, locale)}</DetailField>
//                             </dl>
//                         </Card>
//                     )}
//
//                     {tab === 'linked' && (
//                         <Card className="gap-0 shadow-none">
//                             <header className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
//                                 <h3 className="text-sm font-semibold">{t.adminLinkedAccountsTab || 'Linked Accounts'}</h3>
//                                 <p className="mt-1 text-xs text-slate-500">{t.adminLinkedAccountsHint || 'External providers connected.'}</p>
//                             </header>
//                             {identities.length ? (
//                                 <ul className="divide-y divide-slate-100 px-5 dark:divide-slate-800">
//                                     {identities.map((identity) => (
//                                         <li key={identity.uuid} className="flex flex-wrap items-center gap-3 py-4">
//                                             <span className="grid size-9 place-items-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
//                                                 <Link2 className="size-4"/>
//                                             </span>
//                                             <div className="min-w-0 flex-1">
//                                                 <p className="text-sm font-medium">{identity.displayName || identity.provider}</p>
//                                                 <p className="mt-1 text-xs text-slate-500">{identity.email || identity.provider}</p>
//                                             </div>
//                                             <Badge variant="success">{t.connected || 'Connected'}</Badge>
//                                             <span className="w-full text-xs text-slate-500 sm:w-auto">
//                                                 {t.adminLinkedOn || 'Linked on'}: {dateValue(identity.linkedAt, locale)}
//                                             </span>
//                                         </li>
//                                     ))}
//                                 </ul>
//                             ) : (
//                                 <div className="grid min-h-36 place-items-center px-5 text-sm text-slate-500">
//                                     <div className="text-center">
//                                         <Mail className="mx-auto mb-2 size-5 text-slate-400"/>
//                                         {t.adminNoLinkedAccounts || 'No linked accounts found.'}
//                                     </div>
//                                 </div>
//                             )}
//                         </Card>
//                     )}
//                 </section>
//             </div>
//
//             <AssignRoleDialog open={assignRoleOpen} onClose={() => setAssignRoleOpen(false)} onAssigned={loadDetail} token={token} userId={userId} t={t}/>
//             <GrantPermissionDialog open={grantPermissionOpen} onClose={() => setGrantPermissionOpen(false)} onGranted={loadDetail} token={token} userId={userId} t={t}/>
//         </div>
//     )
// }