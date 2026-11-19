import {useEffect, useState} from 'react'
import {
    History,
    CheckCircle2,
    XCircle,
    Globe,
    MapPin,
    Search,
    RefreshCw,
    Filter
} from 'lucide-react'
import {accountApi as profileApi} from '../../../features/account/api/accountApi'
import {Badge} from '../../ui/badge'
import {Button} from '../../ui/button'
import {Card} from '../../ui/card'
import {Input} from '../../ui/input'

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

export default function LoginHistoryPage({user, locale = 'en', t = {}}) {
    const [history, setHistory] = useState([])
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState('ALL')
    const [search, setSearch] = useState('')

    async function loadHistory() {
        setLoading(true)
        try {
            const data = await profileApi.getLoginHistory(user?.username || 'admin')
            setHistory(data)
        } catch {
            console.error('Failed to load login history')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadHistory()
    }, [user])

    const filtered = history.filter((item) => {
        if (statusFilter !== 'ALL' && item.status !== statusFilter) return false
        if (search) {
            const query = search.toLowerCase()
            return (
                item.device?.toLowerCase().includes(query) ||
                item.browser?.toLowerCase().includes(query) ||
                item.ipAddress?.includes(query) ||
                item.location?.toLowerCase().includes(query)
            )
        }
        return true
    })

    const totalCount = history.length
    const successCount = history.filter((h) => h.status === 'SUCCESS').length
    const failedCount = history.filter((h) => h.status === 'FAILED').length

    return (
        <div className="grid gap-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-lg font-medium text-slate-900 dark:text-white">
                        {t?.history || 'Login History'}
                    </h2>
                    <p className="text-xs text-slate-500">
                        {t?.historyDesc || 'Review recent successful and failed sign-in attempts on your account.'}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={loadHistory} disabled={loading}>
                        <RefreshCw className={`size-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
                        {t?.refresh || 'Refresh'}
                    </Button>
                </div>
            </div>

            {/* Statistics Banner */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Card className="p-4 shadow-none">
                    <div className="flex items-center gap-3">
                        <span className="grid size-9 place-items-center rounded-lg bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                            <History className="size-4" />
                        </span>
                        <div>
                            <p className="text-xs text-slate-500">{locale === 'km' ? 'ការព្យាយាមសរុប' : 'Total Attempts'}</p>
                            <p className="text-lg font-bold">{totalCount}</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-4 shadow-none">
                    <div className="flex items-center gap-3">
                        <span className="grid size-9 place-items-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                            <CheckCircle2 className="size-4" />
                        </span>
                        <div>
                            <p className="text-xs text-slate-500">{locale === 'km' ? 'ជោគជ័យ' : 'Successful Logins'}</p>
                            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{successCount}</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-4 shadow-none">
                    <div className="flex items-center gap-3">
                        <span className="grid size-9 place-items-center rounded-lg bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300">
                            <XCircle className="size-4" />
                        </span>
                        <div>
                            <p className="text-xs text-slate-500">{locale === 'km' ? 'បរាជ័យ / ទប់ស្កាត់' : 'Failed / Blocked'}</p>
                            <p className="text-lg font-bold text-red-600 dark:text-red-400">{failedCount}</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Filter and Search Bar */}
            <Card className="p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 size-4 text-slate-400" />
                        <Input
                            placeholder={locale === 'km' ? 'ស្វែងរកតាមឧបករណ៍, Browser, IP...' : 'Search by device, browser, or IP…'}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 text-xs"
                        />
                    </div>

                    <div className="flex items-center gap-1.5">
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Filter className="size-3" />
                            {locale === 'km' ? 'ស្ថានភាព:' : 'Status:'}
                        </span>
                        {['ALL', 'SUCCESS', 'FAILED'].map((st) => (
                            <button
                                key={st}
                                onClick={() => setStatusFilter(st)}
                                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                                    statusFilter === st
                                        ? 'bg-violet-700 text-white'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                                }`}
                            >
                                {st === 'ALL'
                                    ? (locale === 'km' ? 'ទាំងអស់' : 'All')
                                    : st === 'SUCCESS'
                                    ? (locale === 'km' ? 'ជោគជ័យ' : 'Success')
                                    : (locale === 'km' ? 'បរាជ័យ' : 'Failed')}
                            </button>
                        ))}
                    </div>
                </div>
            </Card>

            {/* Login History List */}
            <Card className="overflow-hidden">
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filtered.map((item) => {
                        const isSuccess = item.status === 'SUCCESS'
                        return (
                            <div
                                key={item.id}
                                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                            >
                                <div className="flex items-start gap-3">
                                    <span
                                        className={`mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg ${
                                            isSuccess
                                                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'
                                                : 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400'
                                        }`}
                                    >
                                        {isSuccess ? <CheckCircle2 className="size-4" /> : <XCircle className="size-4" />}
                                    </span>

                                    <div className="grid gap-0.5">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-xs font-bold text-slate-800 dark:text-white">
                                                {item.device}
                                            </span>
                                            <Badge
                                                variant={isSuccess ? 'success' : 'destructive'}
                                                className="text-[9px]"
                                            >
                                                {isSuccess
                                                    ? (locale === 'km' ? 'ជោគជ័យ' : 'Successful')
                                                    : (locale === 'km' ? 'បរាជ័យ' : 'Failed')}
                                            </Badge>
                                            {item.suspicious && (
                                                <Badge variant="outline" className="border-amber-300 text-amber-700 bg-amber-50 dark:bg-amber-950 text-[9px]">
                                                    {locale === 'km' ? 'គួរឱ្យសង្ស័យ' : 'Suspicious'}
                                                </Badge>
                                            )}
                                        </div>

                                        <p className="text-[11px] text-slate-600 dark:text-slate-300">
                                            <span>{item.browser}</span>
                                            {item.os && <span> · {item.os}</span>}
                                            {item.reason && (
                                                <span className="ml-1 text-red-500 font-medium">({item.reason})</span>
                                            )}
                                        </p>

                                        <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[10px] text-slate-400">
                                            <span className="flex items-center gap-1 font-mono">
                                                <Globe className="size-3" />
                                                {item.ipAddress}
                                            </span>
                                            <span>·</span>
                                            <span className="flex items-center gap-1">
                                                <MapPin className="size-3" />
                                                {item.location}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-left sm:text-right text-[11px] text-slate-500 shrink-0">
                                    <span className="font-medium text-slate-700 dark:text-slate-300">
                                        {formatDateTime(item.timestamp, locale)}
                                    </span>
                                </div>
                            </div>
                        )
                    })}

                    {filtered.length === 0 && (
                        <div className="p-8 text-center text-xs text-slate-400">
                            {locale === 'km' ? 'មិនមានកំណត់ត្រាត្រូវគ្នានឹងការស្វែងរកទេ' : 'No login history matches the filter.'}
                        </div>
                    )}
                </div>
            </Card>
        </div>
    )
}
