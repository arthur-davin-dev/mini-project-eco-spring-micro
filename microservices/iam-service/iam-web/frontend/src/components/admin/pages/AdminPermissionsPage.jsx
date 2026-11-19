import {useCallback, useEffect, useRef, useState} from 'react'
import {
    ArrowDown,
    ArrowUp,
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
    CircleAlert,
    KeyRound,
    Plus,
    RefreshCw,
    Search,
    Edit,
    Trash2,
    Power,
    Check,
    Layers,
    Shield
} from 'lucide-react'
import {adminApi} from '../../../features/admin/api/adminApi'
import CreatePermissionDialog from '../ui/CreatePermissionDialog'
import {createPermissionSchema, validateForm} from '../../../utils/validation'
import {Badge} from '../../ui/badge'
import {Button} from '../../ui/button'
import {Card} from '../../ui/card'
import {Input} from '../../ui/input'
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '../../ui/table'

const pageSize = 15

function ResourceAccessDefinitionModal({open, onClose, permission, locale}) {
    if (!open || !permission) return null
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 my-auto animate-in zoom-in-95 duration-150">
                <header className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Layers className="size-4 text-violet-600" />
                        Resource-Based Access Definition
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
                </header>

                <div className="mt-4 grid gap-3 text-xs">
                    <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-950">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <span className="text-slate-400 text-[11px]">Permission Name</span>
                                <p className="font-mono font-bold text-slate-800 dark:text-white mt-0.5">{permission.name}</p>
                            </div>
                            <div>
                                <span className="text-slate-400 text-[11px]">Resource Target</span>
                                <p className="font-mono font-bold text-slate-800 dark:text-white mt-0.5">{permission.resource}</p>
                            </div>
                            <div>
                                <span className="text-slate-400 text-[11px]">Permitted Action</span>
                                <p className="font-mono font-bold text-slate-800 dark:text-white mt-0.5">{permission.action}</p>
                            </div>
                            <div>
                                <span className="text-slate-400 text-[11px]">System Protected</span>
                                <p className="font-bold text-slate-800 dark:text-white mt-0.5">{permission.system ? 'Yes (Built-in)' : 'No (Custom)'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <p className="font-semibold text-slate-700 dark:text-slate-200">Evaluation Policy Rule:</p>
                        <pre className="rounded-lg bg-slate-900 p-3 text-[11px] font-mono text-emerald-400 overflow-x-auto">
{`{
  "effect": "ALLOW",
  "resource": "arn:iam:service:${permission.resource}/*",
  "action": "${permission.action}",
  "condition": {
    "StringEquals": {
      "iam:Permission": "${permission.name}"
    }
  }
}`}
                        </pre>
                    </div>

                    <div className="flex justify-end pt-2">
                        <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function AdminPermissionsPage({token, t = {}, locale = 'en', initialCreateOpen}) {
    const [keyword, setKeyword] = useState('')
    const [resourceFilter, setResourceFilter] = useState('all')
    const [actionFilter, setActionFilter] = useState('all')
    const [page, setPage] = useState(0)
    const [result, setResult] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [notice, setNotice] = useState('')
    const [createOpen, setCreateOpen] = useState(() => Boolean(initialCreateOpen || new URLSearchParams(window.location.search).get('action') === 'create'))
    const [viewDefinition, setViewDefinition] = useState(null)
    const requestId = useRef(0)

    const loadPermissions = useCallback(async () => {
        const current = ++requestId.current
        setLoading(true)
        setError('')
        const params = {page, size: pageSize, keyword: keyword.trim()}
        if (resourceFilter !== 'all') params.resource = resourceFilter
        if (actionFilter !== 'all') params.action = actionFilter

        try {
            const data = await adminApi.listPermissions(token, params)
            if (current === requestId.current) setResult(data)
        } catch (requestError) {
            if (current === requestId.current) {
                setError(
                    requestError.status === 403
                        ? (t?.adminForbidden || 'Access denied')
                        : (t?.adminPermissionsLoadError || 'Could not load permissions')
                )
            }
        } finally {
            if (current === requestId.current) setLoading(false)
        }
    }, [actionFilter, keyword, page, resourceFilter, t, token])

    useEffect(() => {
        const timer = setTimeout(loadPermissions, keyword ? 250 : 0)
        return () => clearTimeout(timer)
    }, [keyword, loadPermissions])

    useEffect(() => {
        if (initialCreateOpen) setCreateOpen(true)
    }, [initialCreateOpen])

    function notify(msg) {
        setNotice(msg)
        setTimeout(() => setNotice(''), 3500)
    }

    async function handleDelete(permission) {
        if (permission.system) {
            alert('Built-in system permissions cannot be deleted.')
            return
        }
        if (!window.confirm(`Delete permission "${permission.name}"?`)) return
        try {
            await adminApi.deletePermission(token, permission.uuid)
            notify(`Deleted permission ${permission.name}`)
            loadPermissions()
        } catch (err) {
            setError(err.message || 'Failed to delete permission')
        }
    }

    const pages = result?.totalPages || 0
    const total = result?.totalElements || 0
    const start = total === 0 ? 0 : page * pageSize + 1
    const end = Math.min(total, (page + 1) * pageSize)

    return (
        <>
            <section className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-base font-medium text-slate-800 dark:text-white">
                        {t?.permissionManagement || 'Permissions'}
                    </h2>
                    <p className="text-xs text-slate-500">
                        {t?.adminPermissionsIntro || 'Review and configure fine-grained permissions and resource-based access.'}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={loadPermissions} disabled={loading}>
                        <RefreshCw className={`size-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
                        {t?.refresh || 'Refresh'}
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => setCreateOpen(true)}
                        className="bg-violet-700 hover:bg-violet-800 text-white font-semibold text-xs"
                    >
                        <Plus className="size-4 mr-1" />
                        {t?.adminCreatePermission || 'Create Permission'}
                    </Button>
                </div>
            </section>

            {notice && (
                <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
                    <Check className="size-4" />
                    <span>{notice}</span>
                </div>
            )}

            {error && (
                <div role="alert" className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
                    <CircleAlert className="size-4" />
                    <span>{error}</span>
                </div>
            )}

            <Card className="gap-0 overflow-hidden shadow-none">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4 dark:border-slate-800">
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-2.5 size-3.5 text-slate-400" />
                        <Input
                            placeholder={t?.adminSearchPermissions || 'Search permissions…'}
                            value={keyword}
                            onChange={(e) => {
                                setKeyword(e.target.value)
                                setPage(0)
                            }}
                            className="h-8 pl-8 text-xs"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs">
                        <select
                            value={resourceFilter}
                            onChange={(e) => {
                                setResourceFilter(e.target.value)
                                setPage(0)
                            }}
                            className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs dark:border-slate-700 dark:bg-slate-950"
                        >
                            <option value="all">All resources</option>
                            <option value="user">user</option>
                            <option value="role">role</option>
                            <option value="permission">permission</option>
                            <option value="client">client</option>
                        </select>

                        <select
                            value={actionFilter}
                            onChange={(e) => {
                                setActionFilter(e.target.value)
                                setPage(0)
                            }}
                            className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs dark:border-slate-700 dark:bg-slate-950"
                        >
                            <option value="all">All actions</option>
                            <option value="read">read</option>
                            <option value="create">create</option>
                            <option value="update">update</option>
                            <option value="delete">delete</option>
                            <option value="assign">assign</option>
                        </select>
                    </div>
                </div>

                <Table>
                    <TableHeader className="bg-slate-50/80 dark:bg-slate-800/50">
                        <TableRow>
                            <TableHead className="text-xs font-bold">{t?.adminPermissionName || 'Name'}</TableHead>
                            <TableHead className="text-xs font-bold">{t?.adminPermissionResource || 'Resource'}</TableHead>
                            <TableHead className="text-xs font-bold">{t?.adminPermissionAction || 'Action'}</TableHead>
                            <TableHead className="text-xs font-bold">{t?.adminRoleDescription || 'Description'}</TableHead>
                            <TableHead className="text-xs font-bold">Scope / Policy</TableHead>
                            <TableHead className="text-right text-xs font-bold">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading && !result && (
                            Array.from({length: 5}, (_, i) => (
                                <TableRow key={i}>
                                    <TableCell colSpan={6}><div className="h-4 animate-pulse rounded bg-slate-100 dark:bg-slate-800" /></TableCell>
                                </TableRow>
                            ))
                        )}

                        {!loading && !result?.content?.length && (
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center text-xs text-slate-400">
                                    {keyword ? (t?.adminNoMatchingPermissions || 'No matching permissions.') : (t?.adminNoPermissionsFound || 'No permissions found.')}
                                </TableCell>
                            </TableRow>
                        )}

                        {result?.content?.map((perm) => (
                            <TableRow key={perm.uuid} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                                <TableCell className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                                    <div className="flex items-center gap-2">
                                        <KeyRound className="size-3.5 text-violet-600" />
                                        <span>{perm.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="font-mono text-xs text-slate-600 dark:text-slate-300">
                                    <Badge variant="outline" className="text-[10px]">{perm.resource}</Badge>
                                </TableCell>
                                <TableCell className="font-mono text-xs text-slate-600 dark:text-slate-300">
                                    <Badge variant="secondary" className="text-[10px]">{perm.action}</Badge>
                                </TableCell>
                                <TableCell className="text-xs text-slate-500 max-w-xs truncate">{perm.description || '—'}</TableCell>
                                <TableCell>
                                    <button
                                        type="button"
                                        onClick={() => setViewDefinition(perm)}
                                        className="text-[11px] font-semibold text-violet-700 hover:underline cursor-pointer"
                                    >
                                        View Definition
                                    </button>
                                </TableCell>
                                <TableCell className="text-right">
                                    {!perm.system ? (
                                        <Button
                                            variant="ghost"
                                            size="xs"
                                            onClick={() => handleDelete(perm)}
                                            className="text-red-500 hover:bg-red-50 hover:text-red-700"
                                        >
                                            <Trash2 className="size-3.5" />
                                        </Button>
                                    ) : (
                                        <span className="text-[10px] text-slate-400 italic">System</span>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 dark:border-slate-800">
                    <p className="text-xs text-slate-500">
                        Showing {start}–{end} of {total} permissions
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => Math.max(0, p - 1))}
                            disabled={page === 0 || loading}
                        >
                            <ChevronLeft className="size-4" />
                        </Button>
                        <span className="text-xs text-slate-500">
                            Page {pages ? page + 1 : 0} of {pages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => Math.min(pages - 1, p + 1))}
                            disabled={!pages || page >= pages - 1 || loading}
                        >
                            <ChevronRight className="size-4" />
                        </Button>
                    </div>
                </footer>
            </Card>

            <CreatePermissionDialog
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                onCreated={loadPermissions}
                token={token}
                t={t}
                locale={locale}
            />

            <ResourceAccessDefinitionModal
                open={!!viewDefinition}
                onClose={() => setViewDefinition(null)}
                permission={viewDefinition}
                locale={locale}
            />
        </>
    )
}
