import {useEffect, useState} from 'react'
import {
    Laptop,
    Smartphone,
    Tablet,
    Monitor,
    Globe,
    MapPin,
    Clock,
    Shield,
    Trash2,
    RefreshCw,
    SlidersHorizontal,
    CheckCircle2,
    AlertCircle,
    X
} from 'lucide-react'
import {profileApi} from '../../features/profile/api/profileApi'
import {Badge} from '../ui/badge'
import {Button} from '../ui/button'
import {Card} from '../ui/card'

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

function formatRelativeTime(dateValue, locale) {
    if (!dateValue) return '—'
    try {
        let date
        if (dateValue instanceof Date) {
            date = dateValue
        } else if (typeof dateValue === 'number') {
            date = new Date(dateValue)
        } else {
            const str = String(dateValue).trim()
            const isoLike = str.includes(' ') && !str.includes('T') ? str.replace(' ', 'T') : str
            date = new Date(isoLike)
        }

        const time = date.getTime()
        if (Number.isNaN(time) || !Number.isFinite(time)) {
            return typeof dateValue === 'string' ? dateValue : '—'
        }

        const now = Date.now()
        const diffSec = Math.floor((now - time) / 1000)

        if (diffSec < 60 && diffSec >= -60) return locale === 'km' ? 'សកម្មឥឡូវនេះ' : 'Active now'
        if (diffSec < 3600 && diffSec >= 60) {
            const mins = Math.floor(diffSec / 60)
            return locale === 'km' ? `${mins} នាទីមុន` : `${mins}m ago`
        }
        if (diffSec < 86400 && diffSec >= 3600) {
            const hours = Math.floor(diffSec / 3600)
            return locale === 'km' ? `${hours} ម៉ោងមុន` : `${hours}h ago`
        }
        return new Intl.DateTimeFormat(locale === 'km' ? 'km-KH' : 'en-US', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date)
    } catch {
        return typeof dateValue === 'string' ? dateValue : '—'
    }
}

export default function ActiveSessionsPage({user, locale, t, setPage}) {
    const [sessions, setSessions] = useState([])
    const [loading, setLoading] = useState(true)
    const [actioningId, setActioningId] = useState(null)
    const [confirmTerminate, setConfirmTerminate] = useState(null)
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

    async function handleTerminate(session) {
        setActioningId(session.id)
        try {
            const updated = await profileApi.terminateSession(session.id, user?.username)
            setSessions(Array.isArray(updated) ? updated : [])
            setMessage(locale === 'km' ? 'បានបញ្ចប់សម័យដោយជោគជ័យ' : 'Session terminated successfully')
            setConfirmTerminate(null)
            setTimeout(() => setMessage(''), 3000)
        } catch {
            setMessage(t.notSaved || 'Failed to terminate session')
        } finally {
            setActioningId(null)
        }
    }

    return (
        <div className="grid gap-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-lg font-medium text-slate-900 dark:text-white">
                        {t.sessions || 'Active Sessions'}
                    </h2>
                    <p className="text-xs text-slate-500">
                        {t.sessionsDesc || 'Devices currently signed in to your account and their last activity.'}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={loadSessions} disabled={loading}>
                        <RefreshCw className={`size-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
                        {t.refresh || 'Refresh'}
                    </Button>
                    <Button
                        variant="default"
                        size="sm"
                        onClick={() => setPage('sessionManagement')}
                        className="bg-violet-700 hover:bg-violet-800 text-white"
                    >
                        <SlidersHorizontal className="size-3.5 mr-1.5" />
                        {t.sessionManagement || 'Session Management'}
                    </Button>
                </div>
            </div>

            {message && (
                <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
                    <CheckCircle2 className="size-4 shrink-0" />
                    <span>{message}</span>
                </div>
            )}

            <div className="grid gap-4">
                {sessions.map((session) => {
                    const DeviceIcon = getDeviceIcon(session.deviceType)
                    const isCurrent = Boolean(session.isCurrent ?? session.current)
                    const sessionDate = session.lastActiveAt || session.lastActive
                    return (
                        <Card
                            key={session.id}
                            className={`p-5 transition ${
                                isCurrent
                                    ? 'border-violet-300 bg-violet-50/30 dark:border-violet-800 dark:bg-violet-950/20'
                                    : 'hover:border-slate-300 dark:hover:border-slate-700'
                            }`}
                        >
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-start gap-4">
                                    <div
                                        className={`grid size-12 shrink-0 place-items-center rounded-xl ${
                                            isCurrent
                                                ? 'bg-violet-600 text-white'
                                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                        }`}
                                    >
                                        <DeviceIcon className="size-6" strokeWidth={1.8} />
                                    </div>

                                    <div className="grid gap-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="text-sm font-medium text-slate-900 dark:text-white">
                                                {session.deviceName}
                                            </h3>
                                            {isCurrent && (
                                                <Badge variant="default" className="bg-violet-700 text-white">
                                                    {locale === 'km' ? 'ឧបករណ៍នេះ' : 'This device'}
                                                </Badge>
                                            )}
                                            <Badge variant="outline" className="text-[10px]">
                                                {session.os || 'Linux / Web'}
                                            </Badge>
                                        </div>

                                        <p className="text-xs text-slate-600 dark:text-slate-300">
                                            <span className="font-medium">{session.browser}</span>
                                        </p>

                                        <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                                            <span className="flex items-center gap-1">
                                                <Globe className="size-3 text-slate-400" />
                                                {session.ipAddress}
                                            </span>
                                            <span>·</span>
                                            <span className="flex items-center gap-1">
                                                <MapPin className="size-3 text-slate-400" />
                                                {session.location}
                                            </span>
                                            <span>·</span>
                                            <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                                                <Clock className="size-3 text-slate-400" />
                                                {isCurrent ? (locale === 'km' ? 'សកម្មឥឡូវនេះ' : 'Active now') : formatRelativeTime(sessionDate, locale)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end">
                                    {!isCurrent ? (
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            disabled={actioningId === session.id}
                                            onClick={() => setConfirmTerminate(session)}
                                            className="text-xs"
                                        >
                                            <Trash2 className="size-3.5 mr-1.5" />
                                            {locale === 'km' ? 'បញ្ចប់សម័យ' : 'Terminate'}
                                        </Button>
                                    ) : (
                                        <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                            <Shield className="size-4" />
                                            {locale === 'km' ? 'សម័យបច្ចុប្បន្ន' : 'Current Session'}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </Card>
                    )
                })}

                {sessions.length === 0 && !loading && (
                    <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center dark:border-slate-800">
                        <Monitor className="mx-auto size-8 text-slate-400" />
                        <p className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                            {locale === 'km' ? 'គ្មានសម័យសកម្មទេ' : 'No active sessions found'}
                        </p>
                    </div>
                )}
            </div>

            {/* Terminate confirmation modal */}
            {confirmTerminate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
                    <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 my-auto animate-in zoom-in-95 duration-150">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <span className="grid size-10 place-items-center rounded-xl bg-red-50 text-red-600 dark:bg-red-950">
                                    <AlertCircle className="size-5" />
                                </span>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                        {locale === 'km' ? 'បញ្ចប់សម័យឧបករណ៍នេះ?' : 'Terminate session?'}
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        {confirmTerminate.deviceName} ({confirmTerminate.browser})
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setConfirmTerminate(null)}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <X className="size-5" />
                            </button>
                        </div>

                        <p className="mt-4 text-xs leading-5 text-slate-600 dark:text-slate-300">
                            {locale === 'km'
                                ? 'ឧបករណ៍នេះនឹងត្រូវបានកាត់ផ្តាច់ចេញពីគណនីរបស់អ្នកភ្លាមៗ ហើយនឹងត្រូវចូលម្តងទៀតដើម្បីបន្តប្រើប្រាស់។'
                                : 'This device will be immediately signed out and must enter credentials again to access your account.'}
                        </p>

                        <div className="mt-6 flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => setConfirmTerminate(null)}>
                                {t.cancel || 'Cancel'}
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleTerminate(confirmTerminate)}
                                disabled={actioningId === confirmTerminate.id}
                            >
                                {locale === 'km' ? 'បញ្ចប់សម័យ' : 'Confirm Terminate'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
