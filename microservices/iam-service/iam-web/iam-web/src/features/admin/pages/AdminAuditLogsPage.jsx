import {useEffect, useState} from 'react'
import {
    FileText,
    Search,
    RefreshCw,
    Download,
    Filter,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Eye,
    Shield,
    Globe,
    Calendar,
    Layers,
    User,
    KeyRound
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

const CATEGORIES = [
    {id: 'ALL', label: 'All Categories'},
    {id: 'AUTHENTICATION', label: 'Auth & Login'},
    {id: 'USER', label: 'User Lifecycle'},
    {id: 'ROLE', label: 'Role Assignment'},
    {id: 'PERMISSION', label: 'Permission Grants'},
    {id: 'CLIENT', label: 'OAuth2 Clients'},
    {id: 'SECURITY', label: 'Security & Password'},
    {id: 'CONFIG', label: 'System Policies'},
]

export default function AdminAuditLogsPage({locale, t}) {
    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(true)
    const [category, setCategory] = useState('ALL')
    const [status, setStatus] = useState('ALL')
    const [search, setSearch] = useState('')
    const [selectedLog, setSelectedLog] = useState(null)

    async function loadLogs() {
        setLoading(true)
        try {
            const data = await adminApi.listAuditLogs({category, status, keyword: search})
            setLogs(data)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadLogs()
    }, [category, status])

    function handleExportJson() {
        const json = JSON.stringify(logs, null, 2)
        const blob = new Blob([json], {type: 'application/json'})
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `iam-audit-logs-${new Date().toISOString().slice(0, 10)}.json`
        a.click()
    }

    function handleExportCsv() {
        const headers = ['Timestamp', 'Category', 'Action', 'Actor', 'Target', 'Status', 'IP Address', 'Details']
        const rows = logs.map((l) => [
            l.timestamp,
            l.category,
            l.action,
            l.actor,
            l.target,
            l.status,
            l.ipAddress,
            `"${(l.details || '').replace(/"/g, '""')}"`,
        ])
        const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
        const blob = new Blob([csvContent], {type: 'text/csv'})
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `iam-audit-logs-${new Date().toISOString().slice(0, 10)}.csv`
        a.click()
    }

    const filtered = logs.filter((l) => {
        if (search) {
            const q = search.toLowerCase()
            return (
                l.action?.toLowerCase().includes(q) ||
                l.actor?.toLowerCase().includes(q) ||
                l.target?.toLowerCase().includes(q) ||
                l.details?.toLowerCase().includes(q) ||
                l.ipAddress?.includes(q)
            )
        }
        return true
    })

    return (
        <div className="grid gap-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-lg font-medium text-slate-900 dark:text-white">
                        {locale === 'km' ? 'កំណត់ត្រាសវនកម្មប្រព័ន្ធ' : 'System Audit Logs'}
                    </h2>
                    <p className="text-xs text-slate-500">
                        {locale === 'km'
                            ? 'តាមដានរាល់សកម្មភាពរដ្ឋបាល, ការផ្លាស់ប្តូរអ្នកប្រើ, តួនាទី, សិទ្ធិ និងការចូលប្រព័ន្ធ'
                            : 'Immutable audit trail of authentication events, user changes, role assignments, and security updates.'}
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Button variant="outline" size="sm" onClick={loadLogs} disabled={loading}>
                        <RefreshCw className={`size-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
                        {t.refresh || 'Refresh'}
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleExportCsv} className="text-xs">
                        <Download className="size-3.5 mr-1" />
                        Export CSV
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleExportJson} className="text-xs">
                        <Download className="size-3.5 mr-1" />
                        Export JSON
                    </Button>
                </div>
            </div>

            {/* Filter Card */}
            <Card className="p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 size-3.5 text-slate-400" />
                        <Input
                            placeholder="Search by action, actor, target entity, or IP…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-8 pl-8 text-xs"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs dark:border-slate-700 dark:bg-slate-950"
                        >
                            {CATEGORIES.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.label}
                                </option>
                            ))}
                        </select>

                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs dark:border-slate-700 dark:bg-slate-950"
                        >
                            <option value="ALL">All Statuses</option>
                            <option value="SUCCESS">SUCCESS only</option>
                            <option value="FAILED">FAILED only</option>
                        </select>
                    </div>
                </div>
            </Card>

            {/* Audit Logs Table */}
            <Card className="gap-0 overflow-hidden shadow-none">
                <Table>
                    <TableHeader className="bg-slate-50/80 dark:bg-slate-800/50">
                        <TableRow>
                            <TableHead className="text-xs font-bold">Timestamp</TableHead>
                            <TableHead className="text-xs font-bold">Category</TableHead>
                            <TableHead className="text-xs font-bold">Action</TableHead>
                            <TableHead className="text-xs font-bold">Actor</TableHead>
                            <TableHead className="text-xs font-bold">Target</TableHead>
                            <TableHead className="text-xs font-bold">Status</TableHead>
                            <TableHead className="text-right text-xs font-bold">Details</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.map((log) => {
                            const isSuccess = log.status === 'SUCCESS'
                            return (
                                <TableRow
                                    key={log.id}
                                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 cursor-pointer"
                                    onClick={() => setSelectedLog(log)}
                                >
                                    <TableCell className="text-xs font-medium text-slate-500 whitespace-nowrap">
                                        {formatDateTime(log.timestamp, locale)}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="text-[10px]">
                                            {log.category}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-mono text-xs font-bold text-slate-800 dark:text-white">
                                        {log.action}
                                    </TableCell>
                                    <TableCell className="text-xs text-slate-600 dark:text-slate-300">
                                        @{log.actor}
                                    </TableCell>
                                    <TableCell className="text-xs font-mono text-slate-600 dark:text-slate-300">
                                        {log.target || '—'}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={isSuccess ? 'success' : 'destructive'} className="text-[9px]">
                                            {log.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="xs"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setSelectedLog(log)
                                            }}
                                            className="text-violet-600"
                                        >
                                            <Eye className="size-3.5 mr-1" />
                                            View
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            )
                        })}

                        {filtered.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} className="h-32 text-center text-xs text-slate-400">
                                    No audit log events match your filters.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Card>

            {/* Audit Log Detail Dialog */}
            {selectedLog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95">
                        <header className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <FileText className="size-5 text-violet-600" />
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">Audit Event Details</h3>
                            </div>
                            <button onClick={() => setSelectedLog(null)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </header>

                        <div className="mt-4 grid gap-3 text-xs">
                            <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 dark:border-slate-800 dark:bg-slate-950">
                                <div>
                                    <span className="text-slate-400">Action:</span>
                                    <p className="font-mono font-bold mt-0.5">{selectedLog.action}</p>
                                </div>
                                <div>
                                    <span className="text-slate-400">Category:</span>
                                    <p className="font-bold mt-0.5">{selectedLog.category}</p>
                                </div>
                                <div>
                                    <span className="text-slate-400">Actor (Originator):</span>
                                    <p className="font-bold mt-0.5">@{selectedLog.actor}</p>
                                </div>
                                <div>
                                    <span className="text-slate-400">Target Entity:</span>
                                    <p className="font-mono font-bold mt-0.5">{selectedLog.target}</p>
                                </div>
                                <div>
                                    <span className="text-slate-400">Client IP Address:</span>
                                    <p className="font-mono mt-0.5">{selectedLog.ipAddress}</p>
                                </div>
                                <div>
                                    <span className="text-slate-400">Outcome Status:</span>
                                    <p className="mt-0.5">
                                        <Badge variant={selectedLog.status === 'SUCCESS' ? 'success' : 'destructive'} className="text-[9px]">
                                            {selectedLog.status}
                                        </Badge>
                                    </p>
                                </div>
                            </div>

                            <div>
                                <span className="font-semibold text-slate-700 dark:text-slate-300">Event Description / Message:</span>
                                <p className="mt-1 rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-800 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-200">
                                    {selectedLog.details}
                                </p>
                            </div>

                            <div>
                                <span className="font-semibold text-slate-700 dark:text-slate-300">Raw JSON Payload:</span>
                                <pre className="mt-1 max-h-36 overflow-y-auto rounded-lg bg-slate-900 p-3 font-mono text-[11px] text-emerald-400">
                                    {JSON.stringify(selectedLog, null, 2)}
                                </pre>
                            </div>

                            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
                                <Button variant="outline" size="sm" onClick={() => setSelectedLog(null)}>Close</Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
