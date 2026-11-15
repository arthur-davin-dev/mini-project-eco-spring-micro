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
    X
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
    locale: 'en'
}

function formatDate(value, locale) {
    if (!value) return '—'
    return new Intl.DateTimeFormat(locale === 'km' ? 'km-KH' : 'en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    }).format(new Date(value))
}

function userLabel(user) {
    return user.name || [user.givenName, user.familyName].filter(Boolean).join(' ') || user.username
}

export function CreateUserDialog({open, onClose, onCreated, token, t}) {
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
            setError(t.adminPasswordMismatch)
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
                roleUuids: []
            })
            setForm(initialForm)
            onCreated()
            onClose()
        } catch (requestError) {
            setError(requestError.status === 403 ? t.adminForbidden : t.adminCreateError)
        } finally {
            setBusy(false)
        }
    }

    const fields = [
        ['username', t.username, 'text', 'username'],
        ['email', t.email, 'email', 'email'],
        ['givenName', t.firstName, 'text', 'given-name'],
        ['familyName', t.lastName, 'text', 'family-name'],
        ['password', t.adminTemporaryPassword, 'password', 'new-password'],
        ['confirmPassword', t.confirmPassword, 'password', 'new-password'],
    ]

    return (
        <dialog
            ref={setDialog}
            onCancel={(event) => {
                event.preventDefault();
                close()
            }}
            onClick={(event) => {
                if (event.target === dialog) close()
            }}
            aria-labelledby="create-user-title"
            className="fixed left-1/2 top-1/2 m-0 max-h-[min(90dvh,48rem)] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-[var(--color-line)] bg-white p-0 text-[var(--color-ink)] shadow-2xl backdrop:bg-slate-950/40 dark:bg-slate-900"
        >
            <form onSubmit={submit} className="grid gap-5 p-6">
                <header className="flex items-start justify-between gap-4">
                    <div>
                        <h2 id="create-user-title" className="text-lg font-semibold">{t.adminCreateUser}</h2>
                        <p className="mt-1 text-sm text-slate-500">{t.adminCreateUserHint}</p>
                    </div>
                    <button
                        type="button"
                        onClick={close}
                        className="rounded-md p-1 text-slate-500 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-600 dark:hover:bg-slate-800"
                        aria-label={t.close}
                    >
                        <X className="size-5"/>
                    </button>
                </header>
                {error && (
                    <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
                        {error}
                    </p>
                )}
                <div className="grid gap-4 sm:grid-cols-2">
                    {fields.map(([name, label, type, autocomplete]) => (
                        <label className="grid gap-1.5 text-sm font-medium" key={name}>
                            {label}
                            <input
                                required
                                name={name}
                                type={type}
                                autoComplete={autocomplete}
                                minLength={name === 'username' ? 3 : name.includes('Password') || name === 'password' ? 8 : undefined}
                                value={form[name]}
                                onChange={(event) => setForm((current) => ({...current, [name]: event.target.value}))}
                                className="h-10 min-w-0 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-violet-500 dark:border-slate-700 dark:bg-slate-950"
                            />
                        </label>
                    ))}
                </div>
                <label className="grid gap-1.5 text-sm font-medium">{t.language}
                    <select
                        value={form.locale}
                        onChange={(event) => setForm((current) => ({...current, locale: event.target.value}))}
                        className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950"
                    >
                        <option value="en">{t.english}</option>
                        <option value="km">{t.khmer}</option>
                    </select>
                </label>
                <footer className="flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                    <button
                        type="button"
                        onClick={close}
                        className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-medium hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                    >
                        {t.cancel}
                    </button>
                    <button
                        disabled={busy}
                        className="inline-flex h-10 items-center gap-2 rounded-lg bg-violet-700 px-4 text-sm font-semibold text-white hover:bg-violet-800 disabled:opacity-60"
                    >
                        {busy ? <LoaderCircle className="size-4 animate-spin"/> : <UserPlus className="size-4"/>}
                        {busy ? t.saving : t.adminCreateUser}
                    </button>
                </footer>
            </form>
        </dialog>
    )
}

function MetricCard({icon: Icon, label, value, detail, tone = 'violet'}) {
    const tones = {
        violet: 'bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300',
        green: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
        amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
        blue: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300',
    }
    return (
        <Card className="gap-4 p-5 shadow-none">
            <div className="flex items-center gap-3">
                <span className={`grid size-9 place-items-center rounded-lg ${tones[tone]}`}>
                    <Icon className="size-4" strokeWidth={1.8}/>
                </span>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{label}</span>
            </div>
            <div>
                <p className="text-2xl font-semibold tracking-tight">{value}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{detail}</p>
            </div>
        </Card>
    )
}

// Added onSelectUser to props here
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
            setError(requestError.status === 401 ? t.adminSessionExpired : requestError.status === 403 ? t.adminForbidden : t.adminLoadError)
        } finally {
            setLoading(false)
        }
    }, [token, t.adminForbidden, t.adminLoadError, t.adminSessionExpired])

    useEffect(() => {
        const task = window.setTimeout(loadOverview, 0)
        return () => window.clearTimeout(task)
    }, [loadOverview])

    function handleCreated() {
        setDialogOpen(false)
        setNotice(t.adminUserCreated)
        loadOverview()
        window.setTimeout(() => setNotice(''), 3500)
    }

    const metrics = overview ? [
        {
            icon: UsersRound,
            label: t.adminTotalUsers,
            value: overview.totalUsers,
            detail: t.adminUsersInDirectory,
            tone: 'violet'
        },
        {
            icon: CircleCheck,
            label: t.adminActiveUsers,
            value: overview.activeUsers,
            detail: t.adminCanSignIn,
            tone: 'green'
        },
        {
            icon: CircleAlert,
            label: t.adminInactiveUsers,
            value: overview.inactiveUsers,
            detail: t.adminDisabledAccounts,
            tone: 'amber'
        },
        {
            icon: ShieldCheck,
            label: t.adminActiveRoles,
            value: overview.totalRoles,
            detail: t.adminAccessRoles,
            tone: 'blue'
        },
        {
            icon: KeyRound,
            label: t.adminPermissions,
            value: overview.totalPermissions,
            detail: t.adminPermissionRecords,
            tone: 'violet'
        },
    ] : []

    return (
        <>
            <section className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div><p className="text-sm text-slate-500 dark:text-slate-400">{t.adminOverviewIntro}</p></div>
                <div className="flex gap-2">
                    <button
                        onClick={loadOverview}
                        disabled={loading}
                        className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
                    >
                        <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`}/><span>{t.refresh}</span>
                    </button>
                    <button
                        onClick={() => setDialogOpen(true)}
                        className="inline-flex h-10 items-center gap-2 rounded-lg bg-violet-700 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600"
                    >
                        <Plus className="size-4"/>{t.adminCreateUser}
                    </button>
                </div>
            </section>

            {error && (
                <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100" role="alert">
                    <CircleAlert className="mt-0.5 size-4 shrink-0"/>
                    <div className="min-w-0 flex-1">
                        <p className="font-semibold">{t.adminDataUnavailable}</p>
                        <p className="mt-1">{error}</p>
                    </div>
                    <button onClick={loadOverview} className="font-semibold underline underline-offset-4">{t.retry}</button>
                </div>
            )}

            {notice && (
                <div className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200" role="status">
                    <Check className="size-4"/>{notice}
                </div>
            )}

            <section aria-label={t.adminStatistics} className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                {loading && !overview
                    ? Array.from({length: 5}, (_, index) => (
                        <div key={index} className="h-32 animate-pulse rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"/>
                    ))
                    : metrics.map((metric) => <MetricCard key={metric.label} {...metric}/>)
                }
            </section>

            <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(18rem,.8fr)]">
                <Card className="gap-0 overflow-hidden shadow-none">
                    <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                        <div>
                            <h2 className="text-sm font-semibold">{t.adminNewestUsers}</h2>
                            <p className="mt-1 text-xs text-slate-500">{t.adminNewestUsersHint}</p>
                        </div>
                        <button
                            onClick={() => setPage('users')}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-violet-700 hover:text-violet-900 dark:text-violet-300"
                        >
                            {t.adminViewUsers}<ArrowRight className="size-3.5"/>
                        </button>
                    </header>
                    {loading && !overview ? (
                        <div className="grid gap-px">
                            {Array.from({length: 4}, (_, index) => (
                                <div key={index} className="h-16 animate-pulse bg-slate-50 dark:bg-slate-800/50"/>
                            ))}
                        </div>
                    ) : overview?.newestUsers.length ? (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {overview.newestUsers.map((entry) => (
                                <div key={entry.uuid} className="flex min-w-0 items-center gap-3 px-5 py-3.5">
                                    <Avatar user={entry} className="size-9 text-xs"/>
                                    <div className="min-w-0 flex-1">
                                        {/* Added button here to trigger onSelectUser */}
                                        <button
                                            type="button"
                                            onClick={() => onSelectUser(entry.uuid)}
                                            className="truncate text-left text-sm font-medium text-slate-800 hover:text-violet-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-600 dark:text-slate-100 dark:hover:text-violet-300"
                                        >
                                            {userLabel(entry)}
                                        </button>
                                        <p className="truncate text-xs text-slate-500">{entry.email}</p>
                                    </div>
                                    <span className="hidden shrink-0 text-xs text-slate-500 sm:block">
                                        {formatDate(entry.createdAt, locale)}
                                    </span>
                                    <Badge variant={entry.enabled && entry.accountNonLocked ? 'success' : 'secondary'}>
                                        <span className={`size-1.5 rounded-full ${entry.enabled && entry.accountNonLocked ? 'bg-emerald-500' : 'bg-slate-400'}`}/>
                                        {entry.enabled && entry.accountNonLocked ? t.active : t.inactive}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid min-h-40 place-items-center px-5 text-sm text-slate-500">{t.adminNoUsers}</div>
                    )}
                </Card>

                <Card className="gap-0 shadow-none">
                    <header className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                        <h2 className="text-sm font-semibold">{t.adminQuickLinks}</h2>
                        <p className="mt-1 text-xs text-slate-500">{t.adminQuickLinksHint}</p>
                    </header>
                    <nav aria-label={t.adminQuickLinks} className="grid p-2">
                        {[
                            [UsersRound, 'users', t.navUsers, t.adminManageUsers],
                            [ShieldCheck, 'roles', t.navRoles, t.adminManageRoles],
                            [KeyRound, 'userPermissions', t.navUserPermissions, t.adminManagePermissions]
                        ].map(([Icon, page, label, hint]) => (
                            <button
                                key={page}
                                onClick={() => setPage(page)}
                                className="flex items-center gap-3 rounded-lg p-3 text-left transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-600 dark:hover:bg-slate-800"
                            >
                                <span className="grid size-9 place-items-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                    <Icon className="size-4"/>
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="block text-sm font-medium">{label}</span>
                                    <span className="mt-0.5 block text-xs text-slate-500">{hint}</span>
                                </span>
                                <ArrowRight className="size-4 text-slate-400"/>
                            </button>
                        ))}
                    </nav>
                    <div className="mx-4 mb-4 flex gap-3 rounded-lg bg-slate-50 p-3 text-xs leading-5 text-slate-600 dark:bg-slate-800/70 dark:text-slate-300">
                        <Activity className="mt-0.5 size-4 shrink-0 text-violet-600"/>
                        {t.adminStatsNote}
                    </div>
                </Card>
            </div>

            <CreateUserDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                onCreated={handleCreated}
                token={token}
                t={t}
            />
        </>
    )
}