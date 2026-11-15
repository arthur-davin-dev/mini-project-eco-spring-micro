import {useCallback, useEffect, useState} from 'react'
import {
    Activity,
    ArrowRight,
    Check,
    CircleAlert,
    CircleCheck,
    KeyRound,
    LoaderCircle,
    Plus,
    RefreshCw,
    ShieldCheck,
    UserPlus,
    UsersRound,
    Layers,
    FileText,
    Settings
} from 'lucide-react'
import {adminApi} from '../../features/admin/api/adminApi'
import Avatar from '../common/Avatar'
import {Badge} from '../ui/badge'
import {Card} from '../ui/card'

const initialForm = {
    username: '',
    email: '',
    givenName: '',
    familyName: '',
    password: '',
    confirmPassword: '',
    locale: 'en',
}

function formatDate(value, locale) {
    if (!value) return '—'
    const d = new Date(value)
    if (isNaN(d.getTime())) return typeof value === 'string' ? value : '—'
    try {
        return new Intl.DateTimeFormat(locale === 'km' ? 'km-KH' : 'en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        }).format(d)
    } catch {
        return String(value)
    }
}

function formatTime(value, locale) {
    if (!value) return '—'
    const d = new Date(value)
    if (isNaN(d.getTime())) return typeof value === 'string' ? value : '—'
    try {
        return new Intl.DateTimeFormat(locale === 'km' ? 'km-KH' : 'en-US', {
            hour: '2-digit',
            minute: '2-digit',
        }).format(d)
    } catch {
        return String(value)
    }
}

function userLabel(user) {
    return user.name || [user.givenName, user.familyName].filter(Boolean).join(' ') || user.username
}

export function CreateUserDialog({open, onClose, onCreated, token, t, locale}) {
    const [form, setForm] = useState(initialForm)
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState('')
    const [dialog, setDialog] = useState(null)

    useEffect(() => {
        if (open && dialog && !dialog.open) dialog.showModal()
        if (!open && dialog?.open) dialog.close()
    }, [open, dialog])

    function close() {
        setForm(initialForm)
        setError('')
        onClose()
    }

    async function submit(event) {
        event.preventDefault()
        setError('')
        if (form.password !== form.confirmPassword) {
            setError(t.adminPasswordMismatch || 'The passwords do not match.')
            return
        }
        setBusy(true)
        try {
            await adminApi.createUser(token, {
                ...form,
                gender: null,
                birthdate: null,
                phoneNumber: null,
                zoneinfo: null,
                address: null,
                roleUuids: [],
            })
            setForm(initialForm)
            onCreated()
            onClose()
        } catch (requestError) {
            setError(requestError.status === 403 ? t.adminForbidden : (t.adminCreateError || 'Failed to create user.'))
        } finally {
            setBusy(false)
        }
    }

    const fields = [
        ['username', t.username || 'Username', 'text', 'username'],
        ['email', t.email || 'Email', 'email', 'email'],
        ['givenName', t.firstName || 'First name', 'text', 'given-name'],
        ['familyName', t.lastName || 'Last name', 'text', 'family-name'],
        ['password', t.adminTemporaryPassword || 'Temporary password', 'password', 'new-password'],
        ['confirmPassword', t.confirmPassword || 'Confirm password', 'password', 'new-password'],
    ]

    return (
        <dialog
            ref={setDialog}
            onClose={close}
            className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl backdrop:bg-slate-900/50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
        >
            <form onSubmit={submit} className="grid gap-4">
                <header className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                        <UserPlus className="size-5 text-violet-700 dark:text-violet-400" />
                        <h2 className="text-base font-semibold">{t.adminCreateUser || 'Create User'}</h2>
                    </div>
                    <button type="button" onClick={close} className="text-sm font-semibold text-slate-400 hover:text-slate-600">✕</button>
                </header>

                {error && (
                    <div role="alert" className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-100">
                        <CircleAlert className="size-4 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {fields.map(([name, label, type, auto]) => (
                        <label key={name} className="grid gap-1 text-xs font-medium text-slate-700 dark:text-slate-300">
                            <span>{label}</span>
                            <input
                                required
                                type={type}
                                name={name}
                                autoComplete={auto}
                                value={form[name]}
                                onChange={(event) => setForm((curr) => ({...curr, [name]: event.target.value}))}
                                className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs dark:border-slate-700 dark:bg-slate-950"
                            />
                        </label>
                    ))}
                </div>

                <label className="grid gap-1 text-xs font-medium text-slate-700 dark:text-slate-300">
                    <span>{t.language || 'Preferred language'}</span>
                    <select
                        value={form.locale}
                        onChange={(event) => setForm((curr) => ({...curr, locale: event.target.value}))}
                        className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs dark:border-slate-700 dark:bg-slate-950"
                    >
                        <option value="en">{t.english || 'English'}</option>
                        <option value="km">{t.khmer || 'Khmer'}</option>
                    </select>
                </label>

                <footer className="flex justify-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                    <button
                        type="button"
                        onClick={close}
                        className="h-9 rounded-lg border border-slate-200 px-3 text-xs font-medium hover:bg-slate-50 dark:border-slate-700"
                    >
                        {t.cancel || 'Cancel'}
                    </button>
                    <button
                        disabled={busy}
                        className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-violet-700 px-4 text-xs font-semibold text-white hover:bg-violet-800 disabled:opacity-60"
                    >
                        {busy ? <LoaderCircle className="size-3.5 animate-spin" /> : <UserPlus className="size-3.5" />}
                        {busy ? (locale === 'km' ? 'កំពុងបង្កើត...' : 'Creating…') : (t.adminCreateUser || 'Create User')}
                    </button>
                </footer>
            </form>
        </dialog>
    )
}

function MetricCard({icon: Icon, label, value, detail, tone = 'violet', onClick}) {
    const tones = {
        violet: 'bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300',
        green: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
        amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
        blue: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300',
        purple: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300',
    }
    return (
        <Card
            onClick={onClick}
            className={`gap-3 p-4 shadow-none transition ${onClick ? 'cursor-pointer hover:border-violet-300 dark:hover:border-violet-700' : ''}`}
        >
            <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">{label}</span>
                <span className={`grid size-8 place-items-center rounded-lg ${tones[tone] || tones.violet}`}>
                    <Icon className="size-4" strokeWidth={1.8} />
                </span>
            </div>
            <div>
                <p className="text-2xl font-bold tracking-tight">{value}</p>
                <p className="mt-0.5 text-[11px] text-slate-400 truncate">{detail}</p>
            </div>
        </Card>
    )
}

export default function AdminOverviewPage({token, locale, t, setPage, onSelectUser}) {
    const [overview, setOverview] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [dialogOpen, setDialogOpen] = useState(false)
    const [notice, setNotice] = useState('')

    const loadOverview = useCallback(async () => {
        setLoading(true)
        setError('')
        try {
            setOverview(await adminApi.getOverview(token))
        } catch (requestError) {
            setError(
                requestError.status === 401
                    ? t.adminSessionExpired
                    : requestError.status === 403
                    ? t.adminForbidden
                    : (t.adminLoadError || 'Could not load administration overview.')
            )
        } finally {
            setLoading(false)
        }
    }, [token, t.adminForbidden, t.adminLoadError, t.adminSessionExpired])

    useEffect(() => {
        loadOverview()
    }, [loadOverview])

    function handleCreated() {
        setDialogOpen(false)
        setNotice(t.adminUserCreated || 'User account created.')
        loadOverview()
        setTimeout(() => setNotice(''), 3500)
    }

    const metrics = overview
        ? [
              {
                  icon: UsersRound,
                  label: t.adminTotalUsers || 'Total Users',
                  value: overview.totalUsers,
                  detail: t.adminUsersInDirectory || 'Accounts in directory',
                  tone: 'violet',
                  action: () => setPage('users'),
              },
              {
                  icon: CircleCheck,
                  label: t.adminActiveUsers || 'Active Users',
                  value: overview.activeUsers,
                  detail: t.adminCanSignIn || 'Can sign in',
                  tone: 'green',
                  action: () => setPage('users'),
              },
              {
                  icon: CircleAlert,
                  label: t.adminInactiveUsers || 'Inactive / Locked',
                  value: overview.inactiveUsers,
                  detail: t.adminDisabledAccounts || 'Disabled or locked',
                  tone: 'amber',
                  action: () => setPage('users'),
              },
              {
                  icon: ShieldCheck,
                  label: t.adminActiveRoles || 'Roles',
                  value: overview.totalRoles,
                  detail: t.adminAccessRoles || 'Role definitions',
                  tone: 'blue',
                  action: () => setPage('roles'),
              },
              {
                  icon: KeyRound,
                  label: t.adminPermissions || 'Permissions',
                  value: overview.totalPermissions,
                  detail: t.adminPermissionRecords || 'Permission rules',
                  tone: 'purple',
                  action: () => setPage('permissions'),
              },
              {
                  icon: Layers,
                  label: locale === 'km' ? 'អតិថិជន OAuth2' : 'OAuth2 Clients',
                  value: overview.totalClients,
                  detail: locale === 'km' ? 'កម្មវិធីដែលបានចុះឈ្មោះ' : 'Registered apps',
                  tone: 'violet',
                  action: () => setPage('clients'),
              },
          ]
        : []

    return (
        <>
            <section className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-base font-medium text-slate-800 dark:text-white">
                        {t.adminOverview || 'Admin Overview'}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        {t.adminOverviewIntro || 'Manage identity accounts, roles, permissions, OAuth2 clients, and system security.'}
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        onClick={loadOverview}
                        disabled={loading}
                        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900"
                    >
                        <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
                        <span>{t.refresh || 'Refresh'}</span>
                    </button>
                    <button
                        onClick={() => setDialogOpen(true)}
                        className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-violet-700 px-3.5 text-xs font-semibold text-white shadow-xs hover:bg-violet-800"
                    >
                        <Plus className="size-4" />
                        {t.adminCreateUser || 'Create User'}
                    </button>
                </div>
            </section>

            {error && (
                <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100" role="alert">
                    <CircleAlert className="mt-0.5 size-4 shrink-0" />
                    <div className="min-w-0 flex-1">
                        <p className="font-semibold">{t.adminDataUnavailable || 'Overview data unavailable'}</p>
                        <p className="mt-0.5">{error}</p>
                    </div>
                    <button onClick={loadOverview} className="font-semibold underline underline-offset-4">{t.retry || 'Retry'}</button>
                </div>
            )}

            {notice && (
                <div className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200" role="status">
                    <Check className="size-4" />
                    {notice}
                </div>
            )}

            {/* Metric Statistics */}
            <section aria-label="Statistics" className="mb-6 grid gap-3 grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
                {loading && !overview
                    ? Array.from({length: 6}, (_, index) => (
                          <div key={index} className="h-24 animate-pulse rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" />
                      ))
                    : metrics.map((m) => <MetricCard key={m.label} {...m} onClick={m.action} />)}
            </section>

            {/* Quick Action Shortcuts */}
            <section className="mb-6">
                <Card className="p-4 shadow-none">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-3">
                        {locale === 'km' ? 'ផ្លូវកាត់គ្រប់គ្រងរហ័ស' : 'Administration Quick Shortcuts'}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                        {[
                            {label: t.adminCreateUser || 'New User', icon: UserPlus, page: 'users'},
                            {label: t.adminCreateRole || 'New Role', icon: ShieldCheck, page: 'roles'},
                            {label: t.adminCreatePermission || 'New Permission', icon: KeyRound, page: 'permissions'},
                            {label: locale === 'km' ? 'អតិថិជន OAuth2' : 'OAuth2 Client', icon: Layers, page: 'clients'},
                            {label: locale === 'km' ? 'កំណត់ត្រាសវនកម្ម' : 'Audit Logs', icon: FileText, page: 'auditLogs'},
                            {label: locale === 'km' ? 'ការកំណត់ប្រព័ន្ធ' : 'System Config', icon: Settings, page: 'systemConfig'},
                        ].map((btn, idx) => {
                            const Icon = btn.icon
                            return (
                                <button
                                    key={idx}
                                    onClick={() => setPage(btn.page)}
                                    className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/60 p-2.5 text-xs font-semibold text-slate-700 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-300 dark:hover:bg-violet-950/30 transition text-left cursor-pointer"
                                >
                                    <Icon className="size-4 shrink-0 text-violet-600 dark:text-violet-400" />
                                    <span className="truncate">{btn.label}</span>
                                </button>
                            )
                        })}
                    </div>
                </Card>
            </section>

            {/* Split layout: Newest Users & Live Recent Activity */}
            <div className="grid items-start gap-5 lg:grid-cols-2">
                {/* Newest Users */}
                <Card className="gap-0 overflow-hidden shadow-none">
                    <header className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5 dark:border-slate-800">
                        <div>
                            <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                                {t.adminNewestUsers || 'Newest Users'}
                            </h3>
                            <p className="text-[11px] text-slate-500">
                                {t.adminNewestUsersHint || 'Recently provisioned user accounts'}
                            </p>
                        </div>
                        <button
                            onClick={() => setPage('users')}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-violet-700 hover:underline dark:text-violet-400"
                        >
                            {t.adminViewUsers || 'View all'}
                            <ArrowRight className="size-3" />
                        </button>
                    </header>

                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {overview?.newestUsers?.length ? (
                            overview.newestUsers.slice(0, 5).map((user) => (
                                <div
                                    key={user.uuid || user.id}
                                    onClick={() => onSelectUser?.(user.uuid || user.id)}
                                    className="flex items-center justify-between gap-3 px-5 py-3 transition hover:bg-slate-50/70 dark:hover:bg-slate-800/40 cursor-pointer"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <Avatar user={user} className="size-8 text-xs shrink-0" />
                                        <div className="min-w-0">
                                            <p className="truncate text-xs font-bold text-slate-900 dark:text-white">
                                                {userLabel(user)}
                                            </p>
                                            <p className="truncate text-[11px] text-slate-500">
                                                @{user.username} <span className="px-0.5">·</span> {user.email}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <Badge variant={user.enabled ? 'success' : 'secondary'} className="text-[9px]">
                                            {user.enabled ? (t.active || 'Active') : (t.inactive || 'Inactive')}
                                        </Badge>
                                        <span className="text-[10px] text-slate-400">{formatDate(user.createdAt, locale)}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-xs text-slate-400">
                                {t.adminNoUsers || 'No users found'}
                            </div>
                        )}
                    </div>
                </Card>

                {/* Live Recent System Activities */}
                <Card className="gap-0 overflow-hidden shadow-none">
                    <header className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5 dark:border-slate-800">
                        <div>
                            <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                <Activity className="size-4 text-violet-600" />
                                {locale === 'km' ? 'សកម្មភាពប្រព័ន្ធថ្មីៗ' : 'Recent System Activities'}
                            </h3>
                            <p className="text-[11px] text-slate-500">
                                {locale === 'km' ? 'កំណត់ត្រាសវនកម្ម និងការចូលប្រើប្រាស់' : 'Real-time security and administrative events'}
                            </p>
                        </div>
                        <button
                            onClick={() => setPage('auditLogs')}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-violet-700 hover:underline dark:text-violet-400"
                        >
                            {locale === 'km' ? 'មើលទាំងអស់' : 'Audit logs'}
                            <ArrowRight className="size-3" />
                        </button>
                    </header>

                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {overview?.recentActivities?.length ? (
                            overview.recentActivities.slice(0, 5).map((act) => (
                                <div key={act.id} className="flex items-start justify-between gap-3 px-5 py-3">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                                                {act.action}
                                            </span>
                                            <Badge
                                                variant={act.status === 'SUCCESS' ? 'success' : 'destructive'}
                                                className="text-[9px]"
                                            >
                                                {act.status}
                                            </Badge>
                                            <span className="text-[10px] text-slate-400 font-mono">
                                                by {act.actor}
                                            </span>
                                        </div>
                                        <p className="mt-0.5 truncate text-[11px] text-slate-500 dark:text-slate-400">
                                            {act.details}
                                        </p>
                                    </div>
                                    <span className="shrink-0 text-[10px] text-slate-400 font-medium">
                                        {formatTime(act.timestamp, locale)}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-xs text-slate-400">
                                {locale === 'km' ? 'មិនមានសកម្មភាពថ្មីៗទេ' : 'No recent activities'}
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            <CreateUserDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                onCreated={handleCreated}
                token={token}
                t={t}
                locale={locale}
            />
        </>
    )
}
