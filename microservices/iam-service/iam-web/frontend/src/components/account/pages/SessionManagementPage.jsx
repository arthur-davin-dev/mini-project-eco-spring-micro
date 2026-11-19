import {useEffect, useState} from 'react'
import {
    SlidersHorizontal,
    LogOut,
    ShieldAlert,
    ShieldCheck,
    Laptop,
    Smartphone,
    Tablet,
    Monitor,
    Globe,
    MapPin,
    Clock,
    AlertTriangle,
    CheckCircle2,
    RefreshCw,
    X,
    Trash2
} from 'lucide-react'
import {accountApi as profileApi} from '../../../features/account/api/accountApi'
import {Badge} from '../../ui/badge'
import {Button} from '../../ui/button'
import {Card, CardHeader, CardTitle, CardDescription, CardContent} from '../../ui/card'

function safeFormatTime(val) {
    if (!val) return '—'
    try {
        const str = String(val).trim()
        const isoLike = str.includes(' ') && !str.includes('T') ? str.replace(' ', 'T') : str
        const d = new Date(isoLike)
        if (isNaN(d.getTime())) return typeof val === 'string' ? val : '—'
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch {
        return typeof val === 'string' ? val : '—'
    }
}

function getDeviceIcon(type) {
    switch (type?.toLowerCase()) {
        case 'mobile':
            return Smartphone
        case 'tablet':
            return Tablet
        case 'desktop':
            return Monitor
        default:
            return Laptop
    }
}

export default function SessionManagementPage({user, locale, t, setPage, onSignOut}) {
    const [sessions, setSessions] = useState([])
    const [loading, setLoading] = useState(true)
    const [actioning, setActioning] = useState(false)
    const [confirmModal, setConfirmModal] = useState(null) // 'OTHER' or 'ALL' or session object
    const [message, setMessage] = useState('')

    async function loadSessions() {
        setLoading(true)
        try {
            const data = await profileApi.getActiveSessions(user?.username || 'admin')
            setSessions(data)
        } catch {
            setMessage(t.apiError || 'Failed to load sessions')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadSessions()
    }, [user])

    async function handleTerminateSingle(session) {
        setActioning(true)
        try {
            const updated = await profileApi.terminateSession(session.id, user?.username)
            setSessions(Array.isArray(updated) ? updated : [])
            setMessage(locale === 'km' ? `បានបញ្ចប់សម័យលើ ${session.deviceName}` : `Terminated session on ${session.deviceName}`)
            setConfirmModal(null)
            setTimeout(() => setMessage(''), 3500)
        } catch {
            setMessage(t.notSaved || 'Failed to terminate session')
        } finally {
            setActioning(false)
        }
    }

    async function handleTerminateOtherSessions() {
        setActioning(true)
        try {
            const updated = await profileApi.terminateAllSessions(user?.username, true)
            setSessions(Array.isArray(updated) ? updated : [])
            setMessage(locale === 'km' ? 'បានចាកចេញពីឧបករណ៍ផ្សេងទៀតទាំងអស់ដោយជោគជ័យ' : 'Signed out from all other devices successfully')
            setConfirmModal(null)
            setTimeout(() => setMessage(''), 3500)
        } catch {
            setMessage(t.notSaved || 'Action failed')
        } finally {
            setActioning(false)
        }
    }

    async function handleTerminateAll() {
        setActioning(true)
        try {
            await profileApi.terminateAllSessions(user?.username, false)
            setConfirmModal(null)
            if (onSignOut) {
                onSignOut()
            } else {
                window.location.href = '/login?logout'
            }
        } catch {
            setMessage(t.notSaved || 'Action failed')
            setActioning(false)
        }
    }

    const otherSessionsCount = sessions.filter((s) => !(s.isCurrent ?? s.current)).length

    return (
        <div className="grid gap-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-lg font-medium text-slate-900 dark:text-white">
                        {t.sessionManagement || 'Session Management'}
                    </h2>
                    <p className="text-xs text-slate-500">
                        {locale === 'km'
                            ? 'គ្រប់គ្រងសម័យចូលប្រើប្រាស់ និងបញ្ចប់សម័យលើឧបករណ៍ទាំងអស់'
                            : 'Control where you are signed in and terminate active sessions across devices.'}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={loadSessions} disabled={loading}>
                        <RefreshCw className={`size-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
                        {t.refresh || 'Refresh'}
                    </Button>
                </div>
            </div>

            {message && (
                <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
                    <CheckCircle2 className="size-4 shrink-0" />
                    <span>{message}</span>
                </div>
            )}

            {/* Quick Actions Card */}
            <div className="grid gap-4 sm:grid-cols-2">
                <Card className="border-amber-200 bg-gradient-to-br from-amber-50/50 to-white p-5 dark:border-amber-900 dark:from-amber-950/20 dark:to-slate-900">
                    <div className="flex items-start gap-3">
                        <span className="grid size-10 place-items-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                            <LogOut className="size-5" />
                        </span>
                        <div className="min-w-0 flex-1">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                {locale === 'km' ? 'ចាកចេញពីឧបករណ៍ផ្សេងទៀត' : 'Sign out other devices'}
                            </h3>
                            <p className="mt-1 text-xs text-slate-500">
                                {locale === 'km'
                                    ? `បញ្ចប់ ${otherSessionsCount} សម័យលើឧបករណ៍ផ្សេងទៀត ដោយរក្សាទុកសម័យបច្ចុប្បន្ន`
                                    : `End ${otherSessionsCount} active session(s) on other devices while staying signed in here.`}
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={otherSessionsCount === 0 || actioning}
                                onClick={() => setConfirmModal('OTHER')}
                                className="mt-4 border-amber-300 hover:bg-amber-100 text-xs text-amber-800 dark:border-amber-800 dark:text-amber-200"
                            >
                                <LogOut className="size-3.5 mr-1.5" />
                                {locale === 'km' ? 'ចាកចេញពីឧបករណ៍ដទៃ' : 'Sign out other devices'}
                            </Button>
                        </div>
                    </div>
                </Card>

                <Card className="border-red-200 bg-gradient-to-br from-red-50/50 to-white p-5 dark:border-red-900 dark:from-red-950/20 dark:to-slate-900">
                    <div className="flex items-start gap-3">
                        <span className="grid size-10 place-items-center rounded-xl bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">
                            <ShieldAlert className="size-5" />
                        </span>
                        <div className="min-w-0 flex-1">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                {locale === 'km' ? 'ចាកចេញពីគ្រប់ឧបករណ៍ទាំងអស់' : 'Sign out all devices'}
                            </h3>
                            <p className="mt-1 text-xs text-slate-500">
                                {locale === 'km'
                                    ? 'បញ្ចប់គ្រប់សម័យទាំងអស់រួមទាំងឧបករណ៍បច្ចុប្បន្ននេះ និងតម្រូវឱ្យចូលម្តងទៀត'
                                    : 'Immediately revoke all sessions everywhere including this browser.'}
                            </p>
                            <Button
                                variant="destructive"
                                size="sm"
                                disabled={actioning}
                                onClick={() => setConfirmModal('ALL')}
                                className="mt-4 text-xs"
                            >
                                <ShieldAlert className="size-3.5 mr-1.5" />
                                {locale === 'km' ? 'ចាកចេញគ្រប់ឧបករណ៍' : 'Sign out everywhere'}
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Detailed Sessions Table */}
            <Card className="overflow-hidden">
                <CardHeader className="border-b border-slate-100 dark:border-slate-800 p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">
                                {locale === 'km' ? 'បញ្ជីសម័យសកម្មលម្អិត' : 'Active Session Inventory'}
                            </CardTitle>
                            <CardDescription className="text-xs">
                                {locale === 'km'
                                    ? 'ពិនិត្យឧបករណ៍ ទីតាំង និងអាសយដ្ឋាន IP ដែលកំពុងភ្ជាប់'
                                    : 'Review devices, IP addresses, and geographical locations.'}
                            </CardDescription>
                        </div>
                        <Badge variant="outline" className="text-xs font-semibold">
                            {sessions.length} {locale === 'km' ? 'សម័យ' : 'Active'}
                        </Badge>
                    </div>
                </CardHeader>

                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {sessions.map((session) => {
                        const DeviceIcon = getDeviceIcon(session.deviceType)
                        const isCurrent = Boolean(session.isCurrent ?? session.current)
                        const sessionDate = session.lastActiveAt || session.lastActive
                        return (
                            <div
                                key={session.id}
                                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                            >
                                <div className="flex items-center gap-3">
                                    <span
                                        className={`grid size-10 place-items-center rounded-lg ${
                                            isCurrent
                                                ? 'bg-violet-600 text-white'
                                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                                        }`}
                                    >
                                        <DeviceIcon className="size-5" />
                                    </span>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-medium text-slate-800 dark:text-white">
                                                {session.deviceName}
                                            </span>
                                            {isCurrent && (
                                                <Badge variant="success" className="text-[9px]">
                                                    {locale === 'km' ? 'ឧបករណ៍នេះ' : 'Current'}
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                                            <span>{session.browser}</span>
                                            <span>·</span>
                                            <span>{session.os || 'Linux / Web'}</span>
                                            <span>·</span>
                                            <span className="font-mono text-[10px]">{session.ipAddress}</span>
                                            <span>·</span>
                                            <span>{session.location}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between sm:justify-end gap-3">
                                    <div className="text-right text-[11px] text-slate-400">
                                        <span className="block font-medium text-slate-600 dark:text-slate-300">
                                            {isCurrent
                                                ? (locale === 'km' ? 'សកម្មឥឡូវនេះ' : 'Active now')
                                                : safeFormatTime(sessionDate)}
                                        </span>
                                    </div>

                                    {!isCurrent ? (
                                        <Button
                                            variant="destructive"
                                            size="xs"
                                            onClick={() => setConfirmModal(session)}
                                            disabled={actioning}
                                        >
                                            <Trash2 className="size-3 mr-1" />
                                            {locale === 'km' ? 'បញ្ចប់' : 'Revoke'}
                                        </Button>
                                    ) : (
                                        <span className="inline-flex items-center text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                            <ShieldCheck className="size-3.5 mr-1" />
                                            {locale === 'km' ? 'ការពារ' : 'Protected'}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </Card>

            {/* Confirmation Modals */}
            {confirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
                    <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 my-auto animate-in zoom-in-95 duration-150">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <span className="grid size-10 place-items-center rounded-xl bg-red-50 text-red-600 dark:bg-red-950">
                                    <AlertTriangle className="size-5" />
                                </span>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                        {confirmModal === 'ALL'
                                            ? (locale === 'km' ? 'ចាកចេញពីគ្រប់ឧបករណ៍?' : 'Sign out everywhere?')
                                            : confirmModal === 'OTHER'
                                            ? (locale === 'km' ? 'ចាកចេញពីឧបករណ៍ដទៃ?' : 'Sign out other devices?')
                                            : (locale === 'km' ? 'បញ្ចប់សម័យឧបករណ៍នេះ?' : 'Terminate session?')}
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        {confirmModal === 'ALL'
                                            ? (locale === 'km' ? 'ឧបករណ៍ទាំងអស់រួមទាំងនេះ' : 'All devices including this one')
                                            : confirmModal === 'OTHER'
                                            ? (locale === 'km' ? `${otherSessionsCount} ឧបករណ៍ផ្សេងទៀត` : `${otherSessionsCount} other device(s)`)
                                            : confirmModal.deviceName}
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setConfirmModal(null)} className="text-slate-400 hover:text-slate-600">
                                <X className="size-5" />
                            </button>
                        </div>

                        <p className="mt-4 text-xs leading-5 text-slate-600 dark:text-slate-300">
                            {confirmModal === 'ALL'
                                ? (locale === 'km'
                                      ? 'អ្នកនឹងត្រូវបានចាកចេញពីគ្រប់ឧបករណ៍ និងកម្មវិធីទាំងអស់។ អ្នកនឹងត្រូវចូលម្តងទៀត។'
                                      : 'You will be signed out from all browsers and apps. You will need to sign in again.')
                                : confirmModal === 'OTHER'
                                ? (locale === 'km'
                                      ? 'រាល់សម័យនៅលើឧបករណ៍ដទៃទៀតនឹងត្រូវបិទភ្លាមៗ។ សម័យនៅលើឧបករណ៍បច្ចុប្បន្ននេះនឹងនៅតែដំណើរការ។'
                                      : 'Active sessions on all other devices will be terminated immediately. Your current browser session will stay active.')
                                : (locale === 'km'
                                      ? 'ឧបករណ៍នេះនឹងត្រូវបានកាត់ផ្តាច់ចេញពីគណនីរបស់អ្នកភ្លាមៗ។'
                                      : 'This device will be immediately signed out from your account.')}
                        </p>

                        <div className="mt-6 flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => setConfirmModal(null)}>
                                {t.cancel || 'Cancel'}
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                disabled={actioning}
                                onClick={() => {
                                    if (confirmModal === 'ALL') handleTerminateAll()
                                    else if (confirmModal === 'OTHER') handleTerminateOtherSessions()
                                    else handleTerminateSingle(confirmModal)
                                }}
                            >
                                {locale === 'km' ? 'បញ្ជាក់ការចាកចេញ' : 'Confirm'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
