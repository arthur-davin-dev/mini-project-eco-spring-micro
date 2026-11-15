import {useEffect, useState} from 'react'
import {
    Laptop,
    Smartphone,
    Tablet,
    Monitor,
    Search,
    RefreshCw,
    Trash2,
    CheckCircle2
} from 'lucide-react'
import {adminApi} from '../api/adminApi'
import {Badge} from '../../../components/ui/badge'
import {Button} from '../../../components/ui/button'
import {Card} from '../../../components/ui/card'
import {Input} from '../../../components/ui/input'
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '../../../components/ui/table'

function safeFormatTime(val) {
    if (!val) return '—'
    const d = new Date(val)
    if (isNaN(d.getTime())) return typeof val === 'string' ? val : '—'
    try {
        return d.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})
    } catch {
        return String(val)
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

export default function AdminUserSessionsPage({locale, t}) {
    const [sessions, setSessions] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [notice, setNotice] = useState('')
    const [actioningId, setActioningId] = useState(null)

    async function loadSessions() {
        setLoading(true)
        try {
            const data = await adminApi.listAllUserSessions()
            setSessions(data)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadSessions()
    }, [])

    function notify(msg) {
        setNotice(msg)
        setTimeout(() => setNotice(''), 3500)
    }

    async function handleTerminateSession(sessionId, username) {
        if (!window.confirm(`Terminate active session ${sessionId} for user @${username}?`)) return
        setActioningId(sessionId)
        try {
            await adminApi.terminateUserSession(sessionId)
            notify(`Terminated session for @${username}`)
            loadSessions()
        } finally {
            setActioningId(null)
        }
    }

    async function handleTerminateAllForUser(username) {
        if (!window.confirm(`Terminate ALL active sessions for user @${username}?`)) return
        try {
            await adminApi.terminateAllUserSessions(username)
            notify(`Terminated all active sessions for @${username}`)
            loadSessions()
        } catch {
            alert('Failed to terminate sessions')
        }
    }

    const filtered = sessions.filter(
        (s) =>
            s.username?.toLowerCase().includes(search.toLowerCase()) ||
            s.deviceName?.toLowerCase().includes(search.toLowerCase()) ||
            s.ipAddress?.includes(search) ||
            s.location?.toLowerCase().includes(search.toLowerCase())
    )

    const uniqueUsers = new Set(sessions.map((s) => s.username)).size
    const mobileCount = sessions.filter((s) => s.deviceType === 'mobile').length
    const desktopCount = sessions.filter((s) => s.deviceType !== 'mobile').length

    return (
        <div className="grid gap-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-lg font-medium text-slate-900 dark:text-white">
                        {locale === 'km' ? 'ការគ្រប់គ្រងសម័យអ្នកប្រើប្រាស់' : 'User Sessions Management'}
                    </h2>
                    <p className="text-xs text-slate-500">
                        {locale === 'km'
                            ? 'ពិនិត្យសម័យសកម្មរបស់អ្នកប្រើប្រាស់ទាំងអស់ និងបញ្ចប់សម័យតាមតម្រូវការ'
                            : 'Monitor active user sessions across all devices and terminate individual or bulk sessions.'}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={loadSessions} disabled={loading}>
                        <RefreshCw className={`size-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
                        {t.refresh || 'Refresh'}
                    </Button>
                </div>
            </div>

            {notice && (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
                    <CheckCircle2 className="size-4 shrink-0" />
                    <span>{notice}</span>
                </div>
            )}

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Card className="p-4 shadow-none">
                    <p className="text-xs text-slate-500">Total Active Sessions</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{sessions.length}</p>
                </Card>
                <Card className="p-4 shadow-none">
                    <p className="text-xs text-slate-500">Unique Users Online</p>
                    <p className="text-2xl font-bold text-violet-700 dark:text-violet-400 mt-1">{uniqueUsers}</p>
                </Card>
                <Card className="p-4 shadow-none">
                    <p className="text-xs text-slate-500">Device Breakdown</p>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-2">
                        {desktopCount} Desktop · {mobileCount} Mobile
                    </p>
                </Card>
            </div>

            {/* Sessions Table */}
            <Card className="gap-0 overflow-hidden shadow-none">
                <div className="flex items-center justify-between border-b border-slate-100 p-4 dark:border-slate-800">
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-2.5 size-3.5 text-slate-400" />
                        <Input
                            placeholder="Search by user, IP, or device…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-8 pl-8 text-xs"
                        />
                    </div>
                    <Badge variant="outline" className="text-xs">
                        {filtered.length} {locale === 'km' ? 'សម័យ' : 'Active Sessions'}
                    </Badge>
                </div>

                <Table>
                    <TableHeader className="bg-slate-50/80 dark:bg-slate-800/50">
                        <TableRow>
                            <TableHead className="text-xs font-bold">User</TableHead>
                            <TableHead className="text-xs font-bold">Device &amp; OS</TableHead>
                            <TableHead className="text-xs font-bold">Browser</TableHead>
                            <TableHead className="text-xs font-bold">IP &amp; Location</TableHead>
                            <TableHead className="text-xs font-bold">Last Activity</TableHead>
                            <TableHead className="text-right text-xs font-bold">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.map((s) => {
                            const DeviceIcon = getDeviceIcon(s.deviceType)
                            return (
                                <TableRow key={s.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                                    <TableCell className="font-bold text-xs text-slate-900 dark:text-white">
                                        <div className="flex items-center gap-2">
                                            <span className="grid size-7 place-items-center rounded-full bg-violet-100 text-[10px] font-bold text-violet-700">
                                                {s.username?.[0]?.toUpperCase()}
                                            </span>
                                            <div>
                                                <span>@{s.username}</span>
                                                {s.isCurrent && (
                                                    <span className="ml-1.5 text-[9px] font-bold text-emerald-600">
                                                        (You)
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-xs">
                                            <DeviceIcon className="size-4 text-slate-500" />
                                            <span>{s.deviceName}</span>
                                            <Badge variant="outline" className="text-[9px]">{s.os}</Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-xs text-slate-600 dark:text-slate-300">
                                        {s.browser}
                                    </TableCell>
                                    <TableCell className="text-xs">
                                        <div className="font-mono text-[11px] text-slate-600 dark:text-slate-300">{s.ipAddress}</div>
                                        <div className="text-[10px] text-slate-400">{s.location}</div>
                                    </TableCell>
                                    <TableCell className="text-xs text-slate-500">
                                        {safeFormatTime(s.lastActiveAt || s.lastActive)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <Button
                                                variant="outline"
                                                size="xs"
                                                onClick={() => handleTerminateAllForUser(s.username)}
                                                className="text-[10px] text-amber-700 hover:bg-amber-50"
                                            >
                                                Sign out user
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="xs"
                                                disabled={actioningId === s.id}
                                                onClick={() => handleTerminateSession(s.id, s.username)}
                                            >
                                                <Trash2 className="size-3 mr-1" />
                                                Terminate
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )
                        })}

                        {filtered.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center text-xs text-slate-400">
                                    No active user sessions found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Card>
        </div>
    )
}
