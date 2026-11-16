import {useCallback, useEffect, useRef, useState} from 'react'
import {
    ArrowDown,
    ArrowUp,
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
    CircleAlert,
    Plus,
    RefreshCw,
    Search
} from 'lucide-react'
import {adminApi} from '../api/adminApi'
import AdminUserDetailPage from './AdminUserDetailPage'
import CreateUserDialog from '../components/CreateUserDialog'
import Avatar from '../../../components/common/Avatar'
import {Badge} from '../../../components/ui/badge'
import {Button} from '../../../components/ui/button'
import {Card} from '../../../components/ui/card'
import {Input} from '../../../components/ui/input'
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '../../../components/ui/table'

const pageSize = 10

function displayName(user) {
    return user.name || [user.givenName, user.familyName].filter(Boolean).join(' ') || user.username
}

function accountState(user, t) {
    if (!user.accountNonLocked) return {label: t.adminLocked, variant: 'destructive'}
    return user.enabled ? {label: t.active, variant: 'success'} : {label: t.adminDisabled, variant: 'secondary'}
}

function formatDate(date, locale) {
    if (!date) return '—'
    const d = new Date(date)
    if (isNaN(d.getTime())) return typeof date === 'string' ? date : '—'
    try {
        return new Intl.DateTimeFormat(locale === 'km' ? 'km-KH' : 'en-US', {
            day: 'numeric', month: 'short', year: 'numeric',
        }).format(d)
    } catch {
        return String(date)
    }
}

function sortLabel(key, sort, direction, labels) {
    const active = sort === key
    const Icon = active ? (direction === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown
    return (
        <>
            {labels}
            <Icon aria-hidden="true" className="ml-1 inline size-3.5"/>
        </>
    )
}

export default function AdminUsersPage({token, locale, t, selectedUserId, onSelectUser, onBack, initialCreateOpen}) {
    const [keyword, setKeyword] = useState('')
    const [status, setStatus] = useState('all')
    const [sort, setSort] = useState('createdAt')
    const [direction, setDirection] = useState('desc')
    const [page, setPage] = useState(0)
    const [result, setResult] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [createOpen, setCreateOpen] = useState(() => Boolean(initialCreateOpen || new URLSearchParams(window.location.search).get('action') === 'create'))
    const requestId = useRef(0)

    const loadUsers = useCallback(async () => {
        const currentRequest = ++requestId.current
        setLoading(true)
        setError('')

        const params = {page, size: pageSize, keyword: keyword.trim(), sort: `${sort},${direction}`}

        if (status === 'active') {
            params.enabled = true
            params.locked = false
        } else if (status === 'disabled') {
            params.enabled = false
        } else if (status === 'locked') {
            params.locked = true
        }

        try {
            const data = await adminApi.listUsers(token, params)
            if (requestId.current === currentRequest) setResult(data)
        } catch (requestError) {
            if (requestId.current === currentRequest) {
                setError(
                    requestError.status === 403 ? t.adminForbidden
                        : requestError.status === 401 ? t.adminSessionExpired
                            : t.adminUsersLoadError
                )
            }
        } finally {
            if (requestId.current === currentRequest) setLoading(false)
        }
    }, [direction, keyword, page, sort, status, t.adminForbidden, t.adminSessionExpired, t.adminUsersLoadError, token])

    useEffect(() => {
        const timer = window.setTimeout(loadUsers, keyword ? 250 : 0)
        return () => window.clearTimeout(timer)
    }, [loadUsers, keyword])

    useEffect(() => {
        if (initialCreateOpen) setCreateOpen(true)
    }, [initialCreateOpen])

    function changeSort(field) {
        if (sort === field) setDirection((current) => current === 'asc' ? 'desc' : 'asc')
        else {
            setSort(field)
            setDirection(field === 'createdAt' ? 'desc' : 'asc')
        }
        setPage(0)
    }

    const total = result?.totalElements || 0
    const pageCount = result?.totalPages || 0
    const first = total ? page * pageSize + 1 : 0
    const last = Math.min((page + 1) * pageSize, total)
    const rangeText = t.adminShowingUsers
        .replace('{start}', String(first))
        .replace('{end}', String(last))
        .replace('{total}', String(total))

    if (selectedUserId) {
        return <AdminUserDetailPage token={token} locale={locale} t={t} userId={selectedUserId} onBack={onBack}/>
    }

    return (
        <>
            <section className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-base font-medium text-slate-800 dark:text-white">
                        {t.adminUsers || 'User Directory'}
                    </h2>
                    <p className="text-xs text-slate-500">
                        {locale === 'km' ? 'គ្រប់គ្រងអ្នកប្រើប្រាស់ គណនី និងការផ្ទៀងផ្ទាត់' : 'Manage identity user accounts, states, and credentials.'}
                    </p>
                </div>
                <Button onClick={() => setCreateOpen(true)} className="bg-violet-700 hover:bg-violet-800 text-white cursor-pointer">
                    <Plus className="size-4 mr-1.5"/>{t.adminCreateUser || 'Create User'}
                </Button>
            </section>

            <Card className="w-full min-w-0 gap-0 overflow-hidden shadow-none">
                <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4 dark:border-slate-800">
                    <label className="relative min-w-[min(100%,18rem)] flex-1">
                        <span className="sr-only">{t.adminSearchUsers}</span>
                        <Search aria-hidden="true" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"/>
                        <Input
                            value={keyword}
                            onChange={(event) => {
                                setKeyword(event.target.value);
                                setPage(0)
                            }}
                            placeholder={t.adminSearchUsers}
                            className="h-10 pl-9"
                            type="search"
                        />
                    </label>
                    <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                        <span>{t.adminStatus}</span>
                        <select
                            value={status}
                            onChange={(event) => {
                                setStatus(event.target.value);
                                setPage(0)
                            }}
                            className="h-10 min-w-36 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-violet-500 dark:border-slate-700 dark:bg-slate-950"
                        >
                            <option value="all">{t.adminAllStatuses}</option>
                            <option value="active">{t.active}</option>
                            <option value="disabled">{t.adminDisabled}</option>
                            <option value="locked">{t.adminLocked}</option>
                        </select>
                    </label>
                    <Button variant="outline" size="icon" aria-label={t.refresh} onClick={loadUsers} disabled={loading}>
                        <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`}/>
                    </Button>
                </div>

                {error && (
                    <div className="m-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200" role="alert">
                        <CircleAlert className="mt-0.5 size-4 shrink-0"/>
                        <span className="flex-1">{error}</span>
                        <button onClick={loadUsers} className="font-semibold underline underline-offset-2">{t.retry}</button>
                    </div>
                )}

                <Table>
                    <TableHeader className="bg-slate-50/80 dark:bg-slate-800/50">
                        <TableRow className="hover:bg-transparent">
                            <TableHead>{t.adminName}</TableHead>
                            <TableHead>
                                <button
                                    onClick={() => changeSort('username')}
                                    className="inline-flex items-center font-semibold"
                                    aria-sort={sort === 'username' ? (direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                                >
                                    {sortLabel('username', sort, direction, t.adminUsernameColumn)}
                                </button>
                            </TableHead>
                            <TableHead>{t.adminStatus}</TableHead>
                            <TableHead>
                                <button
                                    onClick={() => changeSort('createdAt')}
                                    className="inline-flex items-center font-semibold"
                                    aria-sort={sort === 'createdAt' ? (direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                                >
                                    {sortLabel('createdAt', sort, direction, t.adminCreatedAt)}
                                </button>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading && !result && Array.from({length: 5}, (_, index) => (
                            <TableRow key={index}>
                                {Array.from({length: 4}, (_, cell) => (
                                    <TableCell key={cell}>
                                        <div className="h-4 animate-pulse rounded bg-slate-100 dark:bg-slate-800"/>
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}

                        {!loading && !error && !result?.content.length && (
                            <TableRow>
                                <TableCell colSpan={4} className="h-36 text-center text-sm text-slate-500">
                                    {keyword || status !== 'all' ? t.adminNoMatchingUsers : t.adminNoUsers}
                                </TableCell>
                            </TableRow>
                        )}

                        {result?.content.map((user) => {
                            const state = accountState(user, t)
                            return (
                                <TableRow key={user.uuid}>
                                    <TableCell className="min-w-56">
                                        <div className="flex items-center gap-3">
                                            {/* Passed the complete user object directly */}
                                            <Avatar user={user} className="size-9 text-xs"/>
                                            <div className="min-w-0">
                                                <button
                                                    type="button"
                                                    onClick={() => onSelectUser(user.uuid)}
                                                    className="max-w-56 truncate text-left font-medium text-slate-800 hover:text-violet-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-600 dark:text-slate-100 dark:hover:text-violet-300"
                                                >
                                                    {displayName(user)}
                                                </button>
                                                <p className="max-w-56 truncate text-xs text-slate-500">{user.email}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-slate-600 dark:text-slate-300">{user.username}</TableCell>
                                    <TableCell>
                                        <Badge variant={state.variant}>
                                            <span className={`size-1.5 rounded-full ${state.variant === 'success' ? 'bg-emerald-500' : state.variant === 'destructive' ? 'bg-red-500' : 'bg-slate-400'}`}/>
                                            {state.label}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-slate-500">{formatDate(user.createdAt, locale)}</TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>

                <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 dark:border-slate-800">
                    <p className="text-xs text-slate-500" aria-live="polite">{loading ? t.loading : rangeText}</p>
                    <div className="flex items-center gap-2">
                        <span className="mr-1 text-xs text-slate-500">
                            {t.adminPageOf.replace('{page}', String(pageCount ? page + 1 : 0)).replace('{pages}', String(pageCount))}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((current) => Math.max(0, current - 1))}
                            disabled={page <= 0 || loading}
                            aria-label={t.adminPreviousPage}
                        >
                            <ChevronLeft className="size-4"/>{t.adminPreviousPage}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((current) => Math.min(pageCount - 1, current + 1))}
                            disabled={pageCount === 0 || page >= pageCount - 1 || loading}
                            aria-label={t.adminNextPage}
                        >
                            {t.adminNextPage}<ChevronRight className="size-4"/>
                        </Button>
                    </div>
                </footer>
            </Card>

            <CreateUserDialog
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                onCreated={loadUsers}
                token={token}
                t={t}
                locale={locale}
            />
        </>
    )
}