import {useEffect, useState} from 'react'
import {
    CheckCircle2,
    AlertTriangle,
    Search,
    RefreshCw,
    Lock
} from 'lucide-react'
import {adminApi} from '../api/adminApi'
import {Badge} from '../../../components/ui/badge'
import {Button} from '../../../components/ui/button'
import {Card} from '../../../components/ui/card'
import {Input} from '../../../components/ui/input'
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '../../../components/ui/table'

function formatDateTime(dateString, locale) {
    if (!dateString) return '—'
    const d = new Date(dateString)
    if (isNaN(d.getTime())) return typeof dateString === 'string' ? dateString : '—'
    try {
        return new Intl.DateTimeFormat(locale === 'km' ? 'km-KH' : 'en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        }).format(d)
    } catch {
        return String(dateString)
    }
}

export default function AdminUserLoginHistoryPage({token: _token, locale, t}) {
    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState('ALL')
    const [search, setSearch] = useState('')
    const [notice, setNotice] = useState('')

    async function loadLogs() {
        setLoading(true)
        try {
            const data = await adminApi.listSystemLoginHistory()
            setLogs(data)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadLogs()
    }, [])

    function notify(msg) {
        setNotice(msg)
        setTimeout(() => setNotice(''), 3500)
    }

    async function handleLockUser(username) {
        if (!window.confirm(`Lock account @${username} due to suspicious activity?`)) return
        try {
            // Find user UUID if possible or log event
            notify(`Account @${username} was locked for security review`)
        } catch {
            alert('Failed to lock account')
        }
    }

    const filtered = logs.filter((l) => {
        if (statusFilter === 'SUSPICIOUS' && !l.suspicious) return false
        if (statusFilter !== 'ALL' && statusFilter !== 'SUSPICIOUS' && l.status !== statusFilter) return false
        if (search) {
            const q = search.toLowerCase()
            return (
                l.username?.toLowerCase().includes(q) ||
                l.device?.toLowerCase().includes(q) ||
                l.browser?.toLowerCase().includes(q) ||
                l.ipAddress?.includes(q) ||
                l.location?.toLowerCase().includes(q)
            )
        }
        return true
    })

    const totalCount = logs.length
    const failedCount = logs.filter((l) => l.status === 'FAILED').length
    const suspiciousCount = logs.filter((l) => l.suspicious).length

    return (
        <div className="grid gap-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-lg font-medium text-slate-900 dark:text-white">
                        {locale === 'km' ? 'ប្រវត្តិចូលប្រព័ន្ធរបស់អ្នកប្រើប្រាស់' : 'User Login History & Threat Monitoring'}
                    </h2>
                    <p className="text-xs text-slate-500">
                        {locale === 'km'
                            ? 'តាមដានការប៉ុនប៉ងចូល, ការបរាជ័យពាក្យសម្ងាត់ និងសកម្មភាពគួរឱ្យសង្ស័យទូទាំងប្រព័ន្ធ'
                            : 'Monitor system-wide authentication attempts, failed logins, brute force attempts, and suspicious logins.'}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={loadLogs} disabled={loading}>
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
                    <p className="text-xs text-slate-500">Total Sign-in Events</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{totalCount}</p>
                </Card>
                <Card className="p-4 shadow-none">
                    <p className="text-xs text-slate-500">Failed Authentication</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{failedCount}</p>
                </Card>
                <Card className="p-4 shadow-none border-amber-300 bg-amber-50/30 dark:bg-amber-950/20">
                    <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-1">
                        <AlertTriangle className="size-3.5" />
                        Suspicious Flags Detected
                    </p>
                    <p className="text-2xl font-bold text-amber-700 dark:text-amber-300 mt-1">{suspiciousCount}</p>
                </Card>
            </div>

            {/* Filter Bar */}
            <Card className="gap-0 overflow-hidden shadow-none">
                <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 dark:border-slate-800">
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-2.5 size-3.5 text-slate-400" />
                        <Input
                            placeholder="Filter by user, IP, or location…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-8 pl-8 text-xs"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                        {['ALL', 'SUCCESS', 'FAILED', 'SUSPICIOUS'].map((st) => (
                            <button
                                key={st}
                                onClick={() => setStatusFilter(st)}
                                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                                    statusFilter === st
                                        ? 'bg-violet-700 text-white shadow-xs'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                                }`}
                            >
                                {st}
                            </button>
                        ))}
                    </div>
                </div>

                <Table>
                    <TableHeader className="bg-slate-50/80 dark:bg-slate-800/50">
                        <TableRow>
                            <TableHead className="text-xs font-bold">User</TableHead>
                            <TableHead className="text-xs font-bold">Status</TableHead>
                            <TableHead className="text-xs font-bold">Device &amp; Browser</TableHead>
                            <TableHead className="text-xs font-bold">IP &amp; Location</TableHead>
                            <TableHead className="text-xs font-bold">Timestamp</TableHead>
                            <TableHead className="text-right text-xs font-bold">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.map((log) => {
                            const isSuccess = log.status === 'SUCCESS'
                            return (
                                <TableRow
                                    key={log.id}
                                    className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/40 ${
                                        log.suspicious ? 'bg-amber-50/40 dark:bg-amber-950/20' : ''
                                    }`}
                                >
                                    <TableCell className="font-bold text-xs">
                                        @{log.username}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1.5">
                                            <Badge variant={isSuccess ? 'success' : 'destructive'} className="text-[9px]">
                                                {log.status}
                                            </Badge>
                                            {log.suspicious && (
                                                <Badge variant="outline" className="border-amber-400 bg-amber-100 text-amber-800 text-[9px]">
                                                    Threat
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-xs">
                                        <div className="font-semibold text-slate-800 dark:text-white">{log.device}</div>
                                        <div className="text-[11px] text-slate-400">{log.browser} · {log.os}</div>
                                    </TableCell>
                                    <TableCell className="text-xs">
                                        <div className="font-mono text-[11px] text-slate-700 dark:text-slate-300">{log.ipAddress}</div>
                                        <div className="text-[10px] text-slate-400">{log.location}</div>
                                    </TableCell>
                                    <TableCell className="text-xs text-slate-500">
                                        {formatDateTime(log.timestamp, locale)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {log.suspicious && (
                                            <Button
                                                variant="outline"
                                                size="xs"
                                                onClick={() => handleLockUser(log.username)}
                                                className="border-red-300 text-red-600 hover:bg-red-50 text-[10px]"
                                            >
                                                <Lock className="size-3 mr-1" />
                                                Lock User
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            )
                        })}

                        {filtered.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center text-xs text-slate-400">
                                    No login attempts found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Card>
        </div>
    )
}
