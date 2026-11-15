// import {useCallback, useEffect, useRef, useState} from 'react'
// import {
//     ArrowDown,
//     ArrowUp,
//     ArrowUpDown,
//     ChevronLeft,
//     ChevronRight,
//     CircleAlert,
//     KeyRound,
//     Plus,
//     RefreshCw,
//     Search
// } from 'lucide-react'
// import {adminApi} from '../api/adminApi'
// import {Badge} from '../../../components/ui/badge'
// import {Button} from '../../../components/ui/button'
// import {Card} from '../../../components/ui/card'
// import {Input} from '../../../components/ui/input'
// import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '../../../components/ui/table'
//
// const pageSize = 20
//
// function PermissionDialog({open, onClose, onCreated, token, t}) {
//     const [dialog, setDialog] = useState(null)
//     const [resource, setResource] = useState('')
//     const [action, setAction] = useState('')
//     const [description, setDescription] = useState('')
//     const [busy, setBusy] = useState(false)
//     const [error, setError] = useState('')
//
//     useEffect(() => {
//         if (open && dialog && !dialog.open) dialog.showModal()
//         if (!open && dialog?.open) dialog.close()
//     }, [dialog, open])
//
//     function close() {
//         setResource('')
//         setAction('')
//         setDescription('')
//         setError('')
//         onClose()
//     }
//
//     async function submit(event) {
//         event.preventDefault()
//         setBusy(true)
//         setError('')
//         try {
//             await adminApi.createPermission(token, {
//                 resource: resource.trim(),
//                 action: action.trim(),
//                 description: description.trim()
//             })
//             close()
//             onCreated()
//         } catch (requestError) {
//             setError(requestError.status === 403 ? t.adminForbidden
//                 : requestError.status === 409 ? t.adminPermissionConflict : t.adminPermissionCreateError)
//         } finally {
//             setBusy(false)
//         }
//     }
//
//     return <dialog ref={setDialog} aria-labelledby="create-permission-title" onCancel={(event) => {
//         event.preventDefault();
//         close()
//     }}
//                    onClick={(event) => {
//                        if (event.target === dialog) close()
//                    }}
//                    className="fixed left-1/2 top-1/2 m-0 max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-border bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-950/40 dark:bg-slate-900 dark:text-slate-100">
//         <form onSubmit={submit} className="grid gap-5 p-6">
//             <header><h2 id="create-permission-title" className="text-lg font-semibold">{t.adminCreatePermission}</h2>
//                 <p className="mt-1 text-sm text-slate-500">{t.adminCreatePermissionHint}</p></header>
//             {error && <p role="alert"
//                          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">{error}</p>}
//             <label className="grid gap-1.5 text-sm font-medium">{t.adminPermissionResource}
//                 <Input autoFocus required minLength={2} maxLength={50} pattern="[a-z][a-z_]{1,49}" value={resource}
//                        onChange={(event) => setResource(event.target.value)} placeholder="document" className="h-10"/>
//             </label>
//             <label className="grid gap-1.5 text-sm font-medium">{t.adminPermissionAction}
//                 <Input required minLength={2} maxLength={50} pattern="[a-z][a-z_]{1,49}" value={action}
//                        onChange={(event) => setAction(event.target.value)} placeholder="read" className="h-10"/>
//             </label>
//             <label className="grid gap-1.5 text-sm font-medium">{t.adminRoleDescription}
//                 <textarea maxLength={255} rows={3} value={description}
//                           onChange={(event) => setDescription(event.target.value)}
//                           placeholder={t.adminPermissionDescriptionPlaceholder}
//                           className="resize-y rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring dark:bg-input/30"/>
//             </label>
//             <p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">{t.adminPermissionNameHint}: <code>{resource || 'resource'}:{action || 'action'}</code>
//             </p>
//             <footer className="flex justify-end gap-2 border-t border-border pt-4">
//                 <Button type="button" variant="outline" onClick={close}>{t.cancel}</Button>
//                 <Button type="submit" disabled={busy}><Plus
//                     className="size-4"/>{busy ? t.saving : t.adminCreatePermission}</Button>
//             </footer>
//         </form>
//     </dialog>
// }
//
// export default function AdminPermissionsPage({token, t}) {
//     const [keyword, setKeyword] = useState('')
//     const [active, setActive] = useState('all')
//     const [type, setType] = useState('all')
//     const [sort, setSort] = useState('name')
//     const [direction, setDirection] = useState('asc')
//     const [page, setPage] = useState(0)
//     const [result, setResult] = useState(null)
//     const [loading, setLoading] = useState(true)
//     const [error, setError] = useState('')
//     const [createOpen, setCreateOpen] = useState(false)
//     const requestId = useRef(0)
//
//     const loadPermissions = useCallback(async () => {
//         const currentRequest = ++requestId.current
//         setLoading(true)
//         setError('')
//         const params = {page, size: pageSize, keyword: keyword.trim(), sort: `${sort},${direction}`}
//         if (active !== 'all') params.active = active === 'active'
//         if (type !== 'all') params.system = type === 'builtIn'
//         try {
//             const data = await adminApi.listPermissions(token, params)
//             if (requestId.current === currentRequest) setResult(data)
//         } catch (requestError) {
//             if (requestId.current === currentRequest) setError(requestError.status === 403 ? t.adminForbidden
//                 : requestError.status === 401 ? t.adminSessionExpired : t.adminPermissionsLoadError)
//         } finally {
//             if (requestId.current === currentRequest) setLoading(false)
//         }
//     }, [active, direction, keyword, page, sort, t.adminForbidden, t.adminPermissionsLoadError, t.adminSessionExpired, token, type])
//
//     useEffect(() => {
//         const timer = window.setTimeout(loadPermissions, keyword ? 250 : 0)
//         return () => window.clearTimeout(timer)
//     }, [keyword, loadPermissions])
//
//     function changeSort(field) {
//         if (sort === field) setDirection((current) => current === 'asc' ? 'desc' : 'asc')
//         else {
//             setSort(field);
//             setDirection('asc')
//         }
//         setPage(0)
//     }
//
//     const total = result?.totalElements || 0
//     const pages = result?.totalPages || 0
//     const start = total ? page * pageSize + 1 : 0
//     const end = Math.min((page + 1) * pageSize, total)
//     const range = t.adminShowingPermissions.replace('{start}', String(start)).replace('{end}', String(end)).replace('{total}', String(total))
//     const SortIcon = sort !== 'name' ? ArrowUpDown : direction === 'asc' ? ArrowUp : ArrowDown
//
//     return <>
//         <section className="mb-5 flex justify-end"><Button onClick={() => setCreateOpen(true)}><Plus
//             className="size-4"/>{t.adminCreatePermission}</Button></section>
//         <Card className="w-full min-w-0 gap-0 overflow-hidden shadow-none">
//             <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
//                 <label className="relative min-w-[min(100%,18rem)] flex-1"><span
//                     className="sr-only">{t.adminSearchPermissions}</span>
//                     <Search aria-hidden="true"
//                             className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"/>
//                     <Input type="search" value={keyword} onChange={(event) => {
//                         setKeyword(event.target.value);
//                         setPage(0)
//                     }} placeholder={t.adminSearchPermissions} className="h-10 pl-9"/>
//                 </label>
//                 <label
//                     className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"><span>{t.adminStatus}</span>
//                     <select value={active} onChange={(event) => {
//                         setActive(event.target.value);
//                         setPage(0)
//                     }} className="h-10 min-w-36 rounded-lg border border-input bg-white px-3 text-sm dark:bg-slate-950">
//                         <option value="all">{t.adminAllStatuses}</option>
//                         <option value="active">{t.active}</option>
//                         <option value="inactive">{t.inactive}</option>
//                     </select>
//                 </label>
//                 <label
//                     className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"><span>{t.adminRoleType}</span>
//                     <select value={type} onChange={(event) => {
//                         setType(event.target.value);
//                         setPage(0)
//                     }} className="h-10 min-w-36 rounded-lg border border-input bg-white px-3 text-sm dark:bg-slate-950">
//                         <option value="all">{t.adminAllTypes}</option>
//                         <option value="builtIn">{t.adminBuiltIn}</option>
//                         <option value="custom">{t.adminCustom}</option>
//                     </select>
//                 </label>
//                 <Button variant="outline" size="icon" aria-label={t.refresh} onClick={loadPermissions}
//                         disabled={loading}><RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`}/></Button>
//             </div>
//             {error && <div role="alert"
//                            className="m-4 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
//                 <CircleAlert className="size-4 shrink-0"/><span className="flex-1">{error}</span>
//                 <button onClick={loadPermissions} className="font-semibold underline">{t.retry}</button>
//             </div>}
//             <div className="overflow-x-auto">
//                 <Table><TableHeader className="bg-slate-50/80 dark:bg-slate-800/50"><TableRow
//                     className="hover:bg-transparent">
//                     <TableHead>
//                         <button onClick={() => changeSort('name')} className="inline-flex items-center font-semibold"
//                                 aria-sort={sort === 'name' ? direction === 'asc' ? 'ascending' : 'descending' : 'none'}>{t.adminPermissionName}<SortIcon
//                             aria-hidden="true" className="ml-1 size-3.5"/></button>
//                     </TableHead>
//                     <TableHead>{t.adminRoleDescription}</TableHead><TableHead>{t.adminRoleType}</TableHead><TableHead>{t.adminStatus}</TableHead>
//                 </TableRow></TableHeader>
//                     <TableBody>
//                         {loading && !result && Array.from({length: 6}, (_, row) => <TableRow
//                             key={row}>{Array.from({length: 4}, (_, cell) => <TableCell key={cell}>
//                             <div className="h-4 animate-pulse rounded bg-slate-100 dark:bg-slate-800"/>
//                         </TableCell>)}</TableRow>)}
//                         {!loading && !error && !result?.content.length && <TableRow><TableCell colSpan={4}
//                                                                                                className="h-36 text-center text-sm text-slate-500">{keyword || active !== 'all' || type !== 'all' ? t.adminNoMatchingPermissions : t.adminNoPermissionsFound}</TableCell></TableRow>}
//                         {result?.content.map((permission) => <TableRow key={permission.uuid}>
//                             <TableCell className="min-w-64">
//                                 <div className="flex items-center gap-3"><span
//                                     className="grid size-9 place-items-center rounded-lg bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300"><KeyRound
//                                     className="size-4"/></span><code className="font-medium">{permission.name}</code>
//                                 </div>
//                             </TableCell>
//                             <TableCell
//                                 className="min-w-56 max-w-xl text-slate-600 dark:text-slate-300">{permission.description || '—'}</TableCell>
//                             <TableCell><Badge
//                                 variant="outline">{permission.system ? t.adminBuiltIn : t.adminCustom}</Badge></TableCell>
//                             <TableCell><Badge variant={permission.active ? 'success' : 'secondary'}><span
//                                 className={`size-1.5 rounded-full ${permission.active ? 'bg-emerald-500' : 'bg-slate-400'}`}/>{permission.active ? t.active : t.inactive}
//                             </Badge></TableCell>
//                         </TableRow>)}
//                     </TableBody>
//                 </Table>
//             </div>
//             <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3"><p
//                 aria-live="polite" className="text-xs text-slate-500">{loading ? t.loading : range}</p>
//                 <div className="flex items-center gap-2"><span
//                     className="text-xs text-slate-500">{t.adminPageOf.replace('{page}', String(pages ? page + 1 : 0)).replace('{pages}', String(pages))}</span>
//                     <Button variant="outline" size="sm" onClick={() => setPage((current) => Math.max(0, current - 1))}
//                             disabled={page === 0 || loading}><ChevronLeft className="size-4"/>{t.adminPreviousPage}
//                     </Button>
//                     <Button variant="outline" size="sm"
//                             onClick={() => setPage((current) => Math.min(pages - 1, current + 1))}
//                             disabled={!pages || page >= pages - 1 || loading}>{t.adminNextPage}<ChevronRight
//                         className="size-4"/></Button>
//                 </div>
//             </footer>
//         </Card>
//         <PermissionDialog open={createOpen} onClose={() => setCreateOpen(false)} onCreated={loadPermissions}
//                           token={token} t={t}/>
//     </>
// }


import {useCallback, useEffect, useRef, useState} from 'react'
import {
    ArrowDown,
    ArrowUp,
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
    CircleAlert,
    Edit,
    KeyRound,
    Plus,
    RefreshCw,
    Search,
    Trash2
} from 'lucide-react'
import {adminApi} from '../api/adminApi'
import {Badge} from '../../../components/ui/badge'
import {Button} from '../../../components/ui/button'
import {Card} from '../../../components/ui/card'
import {Input} from '../../../components/ui/input'
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '../../../components/ui/table'

const pageSize = 20

function PermissionDialog({open, onClose, onCreated, token, t}) {
    const [dialog, setDialog] = useState(null)
    const [resource, setResource] = useState('')
    const [action, setAction] = useState('')
    const [description, setDescription] = useState('')
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (open && dialog && !dialog.open) dialog.showModal()
        if (!open && dialog?.open) dialog.close()
    }, [dialog, open])

    function close() {
        setResource('')
        setAction('')
        setDescription('')
        setError('')
        onClose()
    }

    async function submit(event) {
        event.preventDefault()
        setBusy(true)
        setError('')
        try {
            await adminApi.createPermission(token, {
                resource: resource.trim(),
                action: action.trim(),
                description: description.trim()
            })
            close()
            onCreated()
        } catch (requestError) {
            setError(requestError.status === 403 ? t.adminForbidden : requestError.status === 409 ? t.adminPermissionConflict : t.adminPermissionCreateError)
        } finally {
            setBusy(false)
        }
    }

    return (
        <dialog
            ref={setDialog}
            aria-labelledby="create-permission-title"
            onCancel={(event) => {
                event.preventDefault();
                close()
            }}
            onClick={(event) => {
                if (event.target === dialog) close()
            }}
            className="fixed left-1/2 top-1/2 m-0 max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-border bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-950/40 dark:bg-slate-900 dark:text-slate-100"
        >
            <form onSubmit={submit} className="grid gap-5 p-6">
                <header>
                    <h2 id="create-permission-title" className="text-lg font-semibold">{t.adminCreatePermission}</h2>
                    <p className="mt-1 text-sm text-slate-500">{t.adminCreatePermissionHint}</p>
                </header>
                {error && <p role="alert"
                             className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">{error}</p>}
                <label className="grid gap-1.5 text-sm font-medium">{t.adminPermissionResource}
                    <Input autoFocus required minLength={2} maxLength={50} pattern="[a-z][a-z_]{1,49}" value={resource}
                           onChange={(event) => setResource(event.target.value)} placeholder="document"
                           className="h-10"/>
                </label>
                <label className="grid gap-1.5 text-sm font-medium">{t.adminPermissionAction}
                    <Input required minLength={2} maxLength={50} pattern="[a-z][a-z_]{1,49}" value={action}
                           onChange={(event) => setAction(event.target.value)} placeholder="read" className="h-10"/>
                </label>
                <label className="grid gap-1.5 text-sm font-medium">{t.adminRoleDescription}
                    <textarea maxLength={255} rows={3} value={description}
                              onChange={(event) => setDescription(event.target.value)}
                              placeholder={t.adminPermissionDescriptionPlaceholder}
                              className="resize-y rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring dark:bg-input/30"/>
                </label>
                <p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">{t.adminPermissionNameHint}: <code>{resource || 'resource'}:{action || 'action'}</code>
                </p>
                <footer className="flex justify-end gap-2 border-t border-border pt-4">
                    <Button type="button" variant="outline" onClick={close}>{t.cancel}</Button>
                    <Button type="submit" disabled={busy}><Plus
                        className="size-4 mr-2"/>{busy ? t.saving : t.adminCreatePermission}</Button>
                </footer>
            </form>
        </dialog>
    )
}

export default function AdminPermissionsPage({token, t}) {
    const [keyword, setKeyword] = useState('')
    const [active, setActive] = useState('all')
    const [type, setType] = useState('all')
    const [sort, setSort] = useState('name')
    const [direction, setDirection] = useState('asc')
    const [page, setPage] = useState(0)
    const [result, setResult] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [createOpen, setCreateOpen] = useState(false)
    const requestId = useRef(0)

    const loadPermissions = useCallback(async () => {
        const currentRequest = ++requestId.current
        setLoading(true)
        setError('')
        const params = {page, size: pageSize, keyword: keyword.trim(), sort: `${sort},${direction}`}
        if (active !== 'all') params.active = active === 'active'
        if (type !== 'all') params.system = type === 'builtIn'
        try {
            const data = await adminApi.listPermissions(token, params)
            if (requestId.current === currentRequest) setResult(data)
        } catch (requestError) {
            if (requestId.current === currentRequest) setError(requestError.status === 403 ? t.adminForbidden : requestError.status === 401 ? t.adminSessionExpired : t.adminPermissionsLoadError)
        } finally {
            if (requestId.current === currentRequest) setLoading(false)
        }
    }, [active, direction, keyword, page, sort, t, token, type])

    useEffect(() => {
        const timer = window.setTimeout(loadPermissions, keyword ? 250 : 0)
        return () => window.clearTimeout(timer)
    }, [keyword, loadPermissions])

    function changeSort(field) {
        if (sort === field) setDirection((current) => current === 'asc' ? 'desc' : 'asc')
        else {
            setSort(field);
            setDirection('asc')
        }
        setPage(0)
    }

    const total = result?.totalElements || 0
    const pages = result?.totalPages || 0
    const start = total ? page * pageSize + 1 : 0
    const end = Math.min((page + 1) * pageSize, total)
    const range = t.adminShowingPermissions.replace('{start}', String(start)).replace('{end}', String(end)).replace('{total}', String(total))
    const SortIcon = sort !== 'name' ? ArrowUpDown : direction === 'asc' ? ArrowUp : ArrowDown

    return (
        <>
            <section className="mb-5 flex justify-end">
                <Button onClick={() => setCreateOpen(true)}><Plus className="size-4 mr-2"/>{t.adminCreatePermission}
                </Button>
            </section>

            <Card className="w-full min-w-0 gap-0 overflow-hidden shadow-none">
                <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
                    <label className="relative min-w-[min(100%,18rem)] flex-1">
                        <span className="sr-only">{t.adminSearchPermissions}</span>
                        <Search aria-hidden="true"
                                className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"/>
                        <Input type="search" value={keyword} onChange={(event) => {
                            setKeyword(event.target.value);
                            setPage(0)
                        }} placeholder={t.adminSearchPermissions} className="h-10 pl-9"/>
                    </label>
                    <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                        <span>{t.adminStatus}</span>
                        <select value={active} onChange={(event) => {
                            setActive(event.target.value);
                            setPage(0)
                        }}
                                className="h-10 min-w-36 rounded-lg border border-input bg-white px-3 text-sm dark:bg-slate-950">
                            <option value="all">{t.adminAllStatuses}</option>
                            <option value="active">{t.active}</option>
                            <option value="inactive">{t.inactive}</option>
                        </select>
                    </label>
                    <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                        <span>{t.adminRoleType}</span>
                        <select value={type} onChange={(event) => {
                            setType(event.target.value);
                            setPage(0)
                        }}
                                className="h-10 min-w-36 rounded-lg border border-input bg-white px-3 text-sm dark:bg-slate-950">
                            <option value="all">{t.adminAllTypes}</option>
                            <option value="builtIn">{t.adminBuiltIn}</option>
                            <option value="custom">{t.adminCustom}</option>
                        </select>
                    </label>
                    <Button variant="outline" size="icon" aria-label={t.refresh} onClick={loadPermissions}
                            disabled={loading}>
                        <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`}/>
                    </Button>
                </div>

                {error && (
                    <div role="alert"
                         className="m-4 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
                        <CircleAlert className="size-4 shrink-0"/>
                        <span className="flex-1">{error}</span>
                        <button onClick={loadPermissions} className="font-semibold underline">{t.retry}</button>
                    </div>
                )}

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-slate-50/80 dark:bg-slate-800/50">
                            <TableRow className="hover:bg-transparent">
                                <TableHead>
                                    <button onClick={() => changeSort('name')}
                                            className="inline-flex items-center font-semibold"
                                            aria-sort={sort === 'name' ? direction === 'asc' ? 'ascending' : 'descending' : 'none'}>
                                        {t.adminPermissionName}<SortIcon aria-hidden="true" className="ml-1 size-3.5"/>
                                    </button>
                                </TableHead>
                                <TableHead>{t.adminRoleDescription}</TableHead>
                                <TableHead>{t.adminRoleType}</TableHead>
                                <TableHead>{t.adminStatus}</TableHead>
                                {/* Added Actions Header */}
                                <TableHead className="w-[100px] text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading && !result && Array.from({length: 6}, (_, row) => (
                                <TableRow key={row}>
                                    {Array.from({length: 5}, (_, cell) => (
                                        <TableCell key={cell}>
                                            <div className="h-4 animate-pulse rounded bg-slate-100 dark:bg-slate-800"/>
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                            {!loading && !error && !result?.content.length && (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-36 text-center text-sm text-slate-500">
                                        {keyword || active !== 'all' || type !== 'all' ? t.adminNoMatchingPermissions : t.adminNoPermissionsFound}
                                    </TableCell>
                                </TableRow>
                            )}
                            {result?.content.map((permission) => (
                                <TableRow key={permission.uuid}>
                                    <TableCell className="min-w-64">
                                        <div className="flex items-center gap-3">
                                            <span
                                                className="grid size-9 place-items-center rounded-lg bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                                                <KeyRound className="size-4"/>
                                            </span>
                                            <code className="font-medium">{permission.name}</code>
                                        </div>
                                    </TableCell>
                                    <TableCell
                                        className="min-w-56 max-w-xl text-slate-600 dark:text-slate-300">{permission.description || '—'}</TableCell>
                                    <TableCell><Badge
                                        variant="outline">{permission.system ? t.adminBuiltIn : t.adminCustom}</Badge></TableCell>
                                    <TableCell>
                                        <Badge variant={permission.active ? 'success' : 'secondary'}>
                                            <span
                                                className={`size-1.5 rounded-full ${permission.active ? 'bg-emerald-500' : 'bg-slate-400'}`}/>{permission.active ? t.active : t.inactive}
                                        </Badge>
                                    </TableCell>
                                    {/* Added Row Actions */}
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button variant="ghost" size="icon"
                                                    className="h-8 w-8 text-slate-500 hover:text-violet-600">
                                                <Edit className="size-4"/>
                                            </Button>
                                            <Button variant="ghost" size="icon"
                                                    className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-700">
                                                <Trash2 className="size-4"/>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3">
                    <p aria-live="polite" className="text-xs text-slate-500">{loading ? t.loading : range}</p>
                    <div className="flex items-center gap-2">
                        <span
                            className="text-xs text-slate-500">{t.adminPageOf.replace('{page}', String(pages ? page + 1 : 0)).replace('{pages}', String(pages))}</span>
                        <Button variant="outline" size="sm"
                                onClick={() => setPage((current) => Math.max(0, current - 1))}
                                disabled={page === 0 || loading}>
                            <ChevronLeft className="size-4"/>{t.adminPreviousPage}
                        </Button>
                        <Button variant="outline" size="sm"
                                onClick={() => setPage((current) => Math.min(pages - 1, current + 1))}
                                disabled={!pages || page >= pages - 1 || loading}>
                            {t.adminNextPage}<ChevronRight className="size-4"/>
                        </Button>
                    </div>
                </footer>
            </Card>

            <PermissionDialog open={createOpen} onClose={() => setCreateOpen(false)} onCreated={loadPermissions}
                              token={token} t={t}/>
        </>
    )
}
