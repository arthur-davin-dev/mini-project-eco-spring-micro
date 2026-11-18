import {useCallback, useEffect, useRef, useState} from 'react'
import {
    ArrowDown,
    ArrowUp,
    ArrowUpDown,
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    CircleAlert,
    Plus,
    PlusCircle,
    RefreshCw,
    Search,
    ShieldCheck,
    Edit,
    Power,
    Trash2,
    Check,
    KeyRound,
    X,
    LoaderCircle
} from 'lucide-react'
import {adminApi} from '../api/adminApi'
import CreateRoleDialog from '../components/CreateRoleDialog'
import {Badge} from '../../../components/ui/badge'
import {Button} from '../../../components/ui/button'
import {Card} from '../../../components/ui/card'
import {Input} from '../../../components/ui/input'
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '../../../components/ui/table'

const pageSize = 15

function SortLabel({field, current, direction, children}) {
    const Icon = current !== field ? ArrowUpDown : direction === 'asc' ? ArrowUp : ArrowDown
    return (
        <>
            {children}
            <Icon aria-hidden="true" className="ml-1 inline size-3.5" />
        </>
    )
}

function AssignPermissionsToRoleModal({open, onClose, onAssigned, token, role, t, locale}) {
    const [availablePermissions, setAvailablePermissions] = useState([])
    const [selectedPermissions, setSelectedPermissions] = useState([])
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (open) {
            setError('')
            adminApi.listPermissions(token, {page: 0, size: 100}).then((data) => {
                const existing = new Set(role?.permissions || [])
                const unassigned = (data?.content || []).filter((p) => !existing.has(p.name))
                setAvailablePermissions(unassigned)
            }).catch((err) => {
                console.error('Failed to load permissions:', err)
                setError(err?.message || 'Failed to load permissions')
            })
        }
    }, [open, role, token])

    if (!open) return null

    function toggle(uuid) {
        setSelectedPermissions((curr) =>
            curr.includes(uuid) ? curr.filter((id) => id !== uuid) : [...curr, uuid]
        )
    }

    async function submit(e) {
        e.preventDefault()
        if (selectedPermissions.length === 0) return
        setBusy(true)
        setError('')
        try {
            await adminApi.assignPermissionsToRole(token, role.uuid, selectedPermissions)
            onAssigned()
            onClose()
        } catch (err) {
            setError(err.message || 'Failed to assign permissions')
        } finally {
            setBusy(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 my-auto animate-in zoom-in-95 duration-150">
                <header className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <KeyRound className="size-4 text-violet-600" />
                        {locale === 'km' ? 'បន្ថែមសិទ្ធិទៅក្នុងតួនាទី' : 'Assign Permissions to Role'}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
                </header>

                <p className="mt-2 text-xs text-slate-500">
                    {locale === 'km' ? `ជ្រើសរើសសិទ្ធិដើម្បីបន្ថែមទៅកាន់តួនាទី ${role?.name}` : `Select permissions to grant to ${role?.name}`}
                </p>

                {error && (
                    <div className="mt-3 rounded-lg bg-red-50 p-2 text-xs text-red-700 dark:bg-red-950 dark:text-red-300">
                        {error}
                    </div>
                )}

                <form onSubmit={submit} className="mt-4 grid gap-3">
                    <div className="max-h-60 overflow-y-auto rounded-lg border border-slate-200 p-2 dark:border-slate-800 grid gap-1">
                        {availablePermissions.map((p) => {
                            const checked = selectedPermissions.includes(p.uuid)
                            return (
                                <label
                                    key={p.uuid}
                                    onClick={() => toggle(p.uuid)}
                                    className={`flex items-center justify-between p-2 rounded cursor-pointer transition ${
                                        checked ? 'bg-violet-50 font-bold text-violet-800 dark:bg-violet-950 dark:text-violet-200' : 'hover:bg-slate-50'
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={checked}
                                            onChange={() => {}}
                                            className="accent-violet-700"
                                        />
                                        <span className="font-mono text-xs">{p.name}</span>
                                    </div>
                                    <Badge variant="outline" className="text-[9px]">{p.resource}</Badge>
                                </label>
                            )
                        })}

                        {availablePermissions.length === 0 && (
                            <p className="text-xs text-slate-400 p-4 text-center">
                                {locale === 'km' ? 'សិទ្ធិទាំងអស់ត្រូវបានផ្តល់រួចរាល់ហើយ' : 'All available permissions are already assigned.'}
                            </p>
                        )}
                    </div>

                    <div className="flex justify-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                        <Button type="button" variant="outline" size="sm" onClick={onClose}>
                            {t.cancel || 'Cancel'}
                        </Button>
                        <Button
                            type="submit"
                            variant="default"
                            size="sm"
                            disabled={busy || selectedPermissions.length === 0}
                            className="bg-violet-700 text-white"
                        >
                            {busy ? '…' : (locale === 'km' ? 'បន្ថែមសិទ្ធិ' : `Add ${selectedPermissions.length} Permissions`)}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}

function RoleDetail({token, roleId, onBack, t, locale}) {
    const [role, setRole] = useState(null)
    const [keyword, setKeyword] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [notice, setNotice] = useState('')
    const [addPermOpen, setAddPermOpen] = useState(false)
    const [actioning, setActioning] = useState(false)

    const loadRole = useCallback(() => {
        setLoading(true)
        setError('')
        adminApi
            .getRole(token, roleId)
            .then((data) => setRole(data))
            .catch((requestError) => {
                setError(
                    requestError.status === 403
                        ? t.adminForbidden
                        : requestError.status === 401
                        ? t.adminSessionExpired
                        : (t.adminRoleDetailLoadError || 'Failed to load role')
                )
            })
            .finally(() => setLoading(false))
    }, [roleId, t, token])

    useEffect(() => {
        loadRole()
    }, [loadRole])

    function notify(msg) {
        setNotice(msg)
        setTimeout(() => setNotice(''), 3500)
    }

    async function handleToggleActive() {
        if (!role) return
        setActioning(true)
        try {
            if (role.active) {
                await adminApi.deactivateRole(token, roleId)
                notify('Role deactivated')
            } else {
                await adminApi.activateRole(token, roleId)
                notify('Role activated')
            }
            loadRole()
        } catch (err) {
            setError(err.message || 'Status change failed')
        } finally {
            setActioning(false)
        }
    }

    async function handleDeleteRole() {
        if (role.system) {
            alert('Built-in system roles cannot be deleted.')
            return
        }
        if (!window.confirm(`Are you sure you want to delete role "${role.name}"?`)) return
        setActioning(true)
        try {
            await adminApi.deleteRole(token, roleId)
            onBack()
        } catch (err) {
            setError(err.message || 'Failed to delete role')
            setActioning(false)
        }
    }

    async function handleRevokePermission(permName) {
        if (!window.confirm(`Remove permission "${permName}" from role "${role.name}"?`)) return
        try {
            // Find permission UUID by listing permissions
            const data = await adminApi.listPermissions(token, {keyword: permName, size: 5})
            const match = data.content?.find((p) => p.name === permName)
            if (match) {
                await adminApi.revokePermissionFromRole(token, roleId, match.uuid)
                notify(`Removed ${permName}`)
                loadRole()
            }
        } catch (err) {
            setError(err.message || 'Failed to revoke permission')
        }
    }

    const permissions = (role?.permissions || []).filter((permission) =>
        permission.toLowerCase().includes(keyword.trim().toLowerCase())
    )
    const groups = permissions.reduce((grouped, permission) => {
        const service = permission.split(':')[0] || 'other'
        grouped[service] = [...(grouped[service] || []), permission]
        return grouped
    }, {})

    return (
        <div className="space-y-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <Button variant="ghost" onClick={onBack} className="-ml-2 text-slate-500">
                    <ArrowLeft className="size-4 mr-1.5" />
                    {t.adminBackToRoles || 'Back to roles'}
                </Button>

                {!loading && role && (
                    <div className="flex items-center gap-2">
                        <Button
                            variant={role.active ? 'outline' : 'default'}
                            size="sm"
                            disabled={actioning}
                            onClick={handleToggleActive}
                        >
                            <Power className="size-3.5 mr-1" />
                            {role.active ? 'Deactivate' : 'Activate'}
                        </Button>
                        {!role.system && (
                            <Button
                                variant="destructive"
                                size="sm"
                                disabled={actioning}
                                onClick={handleDeleteRole}
                            >
                                <Trash2 className="size-3.5 mr-1" /> Delete
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {notice && (
                <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
                    <Check className="size-4" />
                    <span>{notice}</span>
                </div>
            )}

            {error && (
                <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-xs text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="flex h-48 items-center justify-center">
                    <LoaderCircle className="size-6 animate-spin text-violet-700" />
                </div>
            ) : !error && role ? (
                <>
                    <Card className="flex flex-wrap items-center gap-4 p-5 shadow-none">
                        <span className="grid size-12 place-items-center rounded-xl bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                            <ShieldCheck className="size-6" />
                        </span>
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">{role.name}</h2>
                                <Badge variant="outline">{role.system ? (t.adminBuiltIn || 'Built-in') : (t.adminCustom || 'Custom')}</Badge>
                                <Badge variant={role.active ? 'success' : 'secondary'}>
                                    {role.active ? (t.active || 'Active') : (t.inactive || 'Inactive')}
                                </Badge>
                            </div>
                            <p className="mt-1 text-xs text-slate-500">{role.description || t.adminNoRoleDescription || 'No description provided.'}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{role.permissions?.length || 0}</p>
                            <p className="text-[11px] text-slate-400">{t.adminRolePermissions || 'Permissions'}</p>
                        </div>
                    </Card>

                    <Card className="w-full min-w-0 gap-0 overflow-hidden shadow-none">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4 dark:border-slate-800">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                    {t.adminRolePermissions || 'Permissions'} ({role.permissions?.length || 0})
                                </h3>
                                <p className="text-[11px] text-slate-400">{t.adminPermissionsGroupedHint || 'Permissions assigned to this role, grouped by resource'}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="relative w-full sm:w-60">
                                    <Search className="absolute left-3 top-2.5 size-3.5 text-slate-400" />
                                    <Input
                                        value={keyword}
                                        onChange={(e) => setKeyword(e.target.value)}
                                        placeholder={t.adminFilterPermissions || 'Filter permissions…'}
                                        className="h-8 pl-8 text-xs"
                                    />
                                </div>
                                <Button
                                    size="sm"
                                    onClick={() => setAddPermOpen(true)}
                                    className="bg-violet-700 text-white text-xs"
                                >
                                    <PlusCircle className="size-3.5 mr-1" />
                                    Add Permissions
                                </Button>
                            </div>
                        </div>

                        {Object.keys(groups).length > 0 ? (
                            <div className="space-y-6 p-5">
                                {Object.entries(groups)
                                    .sort(([a], [b]) => a.localeCompare(b))
                                    .map(([service, items]) => (
                                        <section key={service}>
                                            <h4 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                                {service} ({items.length})
                                            </h4>
                                            <ul className="grid list-none grid-cols-1 gap-2 p-0 md:grid-cols-2 xl:grid-cols-3">
                                                {items.map((permission) => (
                                                    <li
                                                        key={permission}
                                                        className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/50 p-2.5 font-mono text-xs dark:border-slate-800 dark:bg-slate-800/40"
                                                    >
                                                        <span className="truncate">{permission}</span>
                                                        <Button
                                                            size="xs"
                                                            variant="ghost"
                                                            onClick={() => handleRevokePermission(permission)}
                                                            className="text-red-500 hover:bg-red-50 hover:text-red-700"
                                                        >
                                                            <X className="size-3.5" />
                                                        </Button>
                                                    </li>
                                                ))}
                                            </ul>
                                        </section>
                                    ))}
                            </div>
                        ) : (
                            <p className="px-5 py-12 text-center text-xs text-slate-400">
                                {keyword ? (t.adminNoMatchingRolePermissions || 'No matching permissions.') : (t.adminRoleHasNoPermissions || 'No permissions assigned to this role.')}
                            </p>
                        )}
                    </Card>

                    <AssignPermissionsToRoleModal
                        open={addPermOpen}
                        onClose={() => setAddPermOpen(false)}
                        onAssigned={loadRole}
                        token={token}
                        role={role}
                        t={t}
                        locale={locale}
                    />
                </>
            ) : null}
        </div>
    )
}

export default function AdminRolesPage({token, t, selectedRoleId, onSelectRole, onBack, locale, initialCreateOpen}) {
    const [keyword, setKeyword] = useState('')
    const [active, setActive] = useState('all')
    const [type, setType] = useState('all')
    const [sort, setSort] = useState('name')
    const [direction, setDirection] = useState('asc')
    const [page, setPage] = useState(0)
    const [result, setResult] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [createOpen, setCreateOpen] = useState(() => Boolean(initialCreateOpen || new URLSearchParams(window.location.search).get('action') === 'create'))
    const requestId = useRef(0)

    const loadRoles = useCallback(async () => {
        const current = ++requestId.current
        setLoading(true)
        setError('')
        const params = {page, size: pageSize, keyword: keyword.trim(), sort: `${sort},${direction}`}
        if (active !== 'all') params.active = active === 'active'
        if (type !== 'all') params.system = type === 'builtin'

        try {
            const data = await adminApi.listRoles(token, params)
            if (current === requestId.current) setResult(data)
        } catch (requestError) {
            if (current === requestId.current) {
                setError(
                    requestError.status === 403
                        ? t.adminForbidden
                        : requestError.status === 401
                        ? t.adminSessionExpired
                        : 'Could not load roles'
                )
            }
        } finally {
            if (current === requestId.current) setLoading(false)
        }
    }, [active, direction, keyword, page, sort, t, token, type])

    useEffect(() => {
        const timer = setTimeout(loadRoles, keyword ? 250 : 0)
        return () => clearTimeout(timer)
    }, [keyword, loadRoles])

    useEffect(() => {
        if (initialCreateOpen) setCreateOpen(true)
    }, [initialCreateOpen])

    if (selectedRoleId) {
        return (
            <RoleDetail
                token={token}
                roleId={selectedRoleId}
                onBack={onBack}
                t={t}
                locale={locale}
            />
        )
    }

    const pages = result?.totalPages || 0
    const total = result?.totalElements || 0
    const start = total === 0 ? 0 : page * pageSize + 1
    const end = Math.min(total, (page + 1) * pageSize)
    const range = (t.adminShowingRoles || '{start}–{end} of {total} roles')
        .replace('{start}', String(start))
        .replace('{end}', String(end))
        .replace('{total}', String(total))

    function changeSort(field) {
        if (sort === field) {
            setDirection((d) => (d === 'asc' ? 'desc' : 'asc'))
        } else {
            setSort(field)
            setDirection('asc')
        }
        setPage(0)
    }

    return (
        <>
            <section className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-base font-medium text-slate-800 dark:text-white">
                        {t.roleManagement || 'Roles'}
                    </h2>
                    <p className="text-xs text-slate-500">
                        {t.rolesDesc || 'Roles group permissions that can be assigned to user accounts.'}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={loadRoles} disabled={loading}>
                        <RefreshCw className={`size-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
                        {t.refresh || 'Refresh'}
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => setCreateOpen(true)}
                        className="bg-violet-700 hover:bg-violet-800 text-white font-semibold text-xs"
                    >
                        <Plus className="size-4 mr-1" />
                        {t.adminCreateRole || 'Create Role'}
                    </Button>
                </div>
            </section>

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
                            placeholder={t.adminSearchRoles || 'Search roles…'}
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
                            value={type}
                            onChange={(e) => {
                                setType(e.target.value)
                                setPage(0)
                            }}
                            className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs dark:border-slate-700 dark:bg-slate-950"
                        >
                            <option value="all">{t.adminAllTypes || 'All types'}</option>
                            <option value="builtin">{t.adminBuiltIn || 'Built-in'}</option>
                            <option value="custom">{t.adminCustom || 'Custom'}</option>
                        </select>

                        <select
                            value={active}
                            onChange={(e) => {
                                setActive(e.target.value)
                                setPage(0)
                            }}
                            className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs dark:border-slate-700 dark:bg-slate-950"
                        >
                            <option value="all">{t.adminAllStatuses || 'All statuses'}</option>
                            <option value="active">{t.active || 'Active'}</option>
                            <option value="inactive">{t.inactive || 'Inactive'}</option>
                        </select>
                    </div>
                </div>

                <Table>
                    <TableHeader className="bg-slate-50/80 dark:bg-slate-800/50">
                        <TableRow>
                            <TableHead>
                                <button
                                    onClick={() => changeSort('name')}
                                    className="inline-flex items-center font-bold text-xs"
                                >
                                    <SortLabel field="name" current={sort} direction={direction}>
                                        {t.adminRoleName || 'Name'}
                                    </SortLabel>
                                </button>
                            </TableHead>
                            <TableHead className="text-xs font-bold">{t.adminRoleDescription || 'Description'}</TableHead>
                            <TableHead className="text-xs font-bold">{t.adminRoleType || 'Type'}</TableHead>
                            <TableHead className="text-xs font-bold">{t.adminStatus || 'Status'}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading && !result && (
                            Array.from({length: 5}, (_, i) => (
                                <TableRow key={i}>
                                    <TableCell colSpan={4}><div className="h-4 animate-pulse rounded bg-slate-100 dark:bg-slate-800" /></TableCell>
                                </TableRow>
                            ))
                        )}

                        {!loading && !result?.content?.length && (
                            <TableRow>
                                <TableCell colSpan={4} className="h-32 text-center text-xs text-slate-400">
                                    {keyword ? (t.adminNoMatchingRoles || 'No matching roles.') : (t.adminNoRolesFound || 'No roles created yet.')}
                                </TableCell>
                            </TableRow>
                        )}

                        {result?.content?.map((role) => (
                            <TableRow
                                key={role.uuid}
                                onClick={() => onSelectRole?.(role.uuid || role.id || role)}
                                className="cursor-pointer hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                            >
                                <TableCell className="font-bold text-xs">
                                    <div className="flex items-center gap-2.5">
                                        <span className="grid size-7 place-items-center rounded-lg bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                                            <ShieldCheck className="size-4" />
                                        </span>
                                        <span className="hover:text-violet-700 dark:hover:text-violet-300">{role.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-xs text-slate-500">{role.description || '—'}</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="text-[10px]">
                                        {role.system ? (t.adminBuiltIn || 'Built-in') : (t.adminCustom || 'Custom')}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={role.active ? 'success' : 'secondary'} className="text-[10px]">
                                        {role.active ? (t.active || 'Active') : (t.inactive || 'Inactive')}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 dark:border-slate-800">
                    <p className="text-xs text-slate-500">{loading ? (t.loading || 'Loading…') : range}</p>
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

            <CreateRoleDialog
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                onCreated={loadRoles}
                token={token}
                t={t}
                locale={locale}
            />
        </>
    )
}
