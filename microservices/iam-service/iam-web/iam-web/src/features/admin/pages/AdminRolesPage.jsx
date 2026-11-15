// import {useCallback, useEffect, useRef, useState} from 'react'
// import {
//     ArrowDown,
//     ArrowUp,
//     ArrowUpDown,
//     ArrowLeft,
//     ChevronLeft,
//     ChevronRight,
//     CircleAlert,
//     Plus,
//     RefreshCw,
//     Search,
//     ShieldCheck
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
// function SortLabel({field, current, direction, children}) {
//     const Icon = current !== field ? ArrowUpDown : direction === 'asc' ? ArrowUp : ArrowDown
//     return <>{children}<Icon aria-hidden="true" className="ml-1 inline size-3.5"/></>
// }
//
// function CreateRoleDialog({open, onClose, onCreated, token, t}) {
//     const [dialog, setDialog] = useState(null)
//     const [name, setName] = useState('')
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
//         setName('')
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
//             await adminApi.createRole(token, {name: name.trim(), description: description.trim(), permissionUuids: []})
//             close()
//             onCreated()
//         } catch (requestError) {
//             setError(requestError.status === 403 ? t.adminForbidden
//                 : requestError.status === 409 ? t.adminRoleConflict : t.adminRoleCreateError)
//         } finally {
//             setBusy(false)
//         }
//     }
//
//     return <dialog ref={setDialog} aria-labelledby="create-role-title" onCancel={(event) => {
//         event.preventDefault();
//         close()
//     }}
//                    onClick={(event) => {
//                        if (event.target === dialog) close()
//                    }}
//                    className="fixed left-1/2 top-1/2 m-0 max-h-[min(90dvh,44rem)] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-border bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-950/40 dark:bg-slate-900 dark:text-slate-100">
//         <form onSubmit={submit} className="grid gap-5 p-6">
//             <header><h2 id="create-role-title" className="text-lg font-semibold">{t.adminCreateRole}</h2><p
//                 className="mt-1 text-sm text-slate-500">{t.adminCreateRoleHint}</p></header>
//             {error && <p role="alert"
//                          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">{error}</p>}
//             <label className="grid gap-1.5 text-sm font-medium">{t.adminRoleName}
//                 <Input autoFocus required minLength={2} maxLength={50} value={name}
//                        onChange={(event) => setName(event.target.value)} placeholder={t.adminRoleNamePlaceholder}
//                        className="h-10"/>
//             </label>
//             <label className="grid gap-1.5 text-sm font-medium">{t.adminRoleDescription}
//                 <textarea maxLength={255} rows={4} value={description}
//                           onChange={(event) => setDescription(event.target.value)}
//                           placeholder={t.adminRoleDescriptionPlaceholder}
//                           className="resize-y rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring dark:bg-input/30"/>
//             </label>
//             <p className="rounded-lg bg-slate-50 p-3 text-xs leading-5 text-slate-600 dark:bg-slate-800 dark:text-slate-300">{t.adminRolePermissionsAfterCreate}</p>
//             <footer className="flex justify-end gap-2 border-t border-border pt-4">
//                 <Button type="button" variant="outline" onClick={close}>{t.cancel}</Button>
//                 <Button type="submit" disabled={busy}><Plus className="size-4"/>{busy ? t.saving : t.adminCreateRole}
//                 </Button>
//             </footer>
//         </form>
//     </dialog>
// }
//
// function RoleDetail({token, roleId, onBack, t}) {
//     const [role, setRole] = useState(null)
//     const [keyword, setKeyword] = useState('')
//     const [loading, setLoading] = useState(true)
//     const [error, setError] = useState('')
//
//     useEffect(() => {
//         let active = true
//         setLoading(true)
//         setError('')
//         adminApi.getRole(token, roleId).then((data) => {
//             if (active) setRole(data)
//         }).catch((requestError) => {
//             if (active) setError(requestError.status === 403 ? t.adminForbidden
//                 : requestError.status === 401 ? t.adminSessionExpired : t.adminRoleDetailLoadError)
//         }).finally(() => {
//             if (active) setLoading(false)
//         })
//         return () => {
//             active = false
//         }
//     }, [roleId, t.adminForbidden, t.adminRoleDetailLoadError, t.adminSessionExpired, token])
//
//     const permissions = (role?.permissions || []).filter((permission) =>
//         permission.toLocaleLowerCase().includes(keyword.trim().toLocaleLowerCase()))
//     const groups = permissions.reduce((grouped, permission) => {
//         const service = permission.split(':')[0] || t.adminOtherGroup
//         grouped[service] = [...(grouped[service] || []), permission]
//         return grouped
//     }, {})
//
//     return <div className="space-y-5">
//         <Button variant="ghost" onClick={onBack} className="-ml-2"><ArrowLeft className="size-4"/>{t.adminBackToRoles}
//         </Button>
//         {error && <div role="alert"
//                        className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">{error}</div>}
//         {loading ? <Card className="space-y-4 p-6 shadow-none">
//             <div className="h-5 w-40 animate-pulse rounded bg-slate-100 dark:bg-slate-800"/>
//             <div className="h-10 w-full animate-pulse rounded bg-slate-100 dark:bg-slate-800"/>
//             <div className="h-48 w-full animate-pulse rounded bg-slate-100 dark:bg-slate-800"/>
//         </Card> : !error && role && <>
//             <Card className="flex flex-wrap items-center gap-4 p-5 shadow-none">
//                 <span
//                     className="grid size-12 place-items-center rounded-xl bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300"><ShieldCheck
//                     className="size-5"/></span>
//                 <div className="min-w-0 flex-1">
//                     <div className="flex flex-wrap items-center gap-2"><h2
//                         className="m-0 text-xl font-semibold">{role.name}</h2>
//                         <Badge variant="outline">{role.system ? t.adminBuiltIn : t.adminCustom}</Badge>
//                         <Badge
//                             variant={role.active ? 'success' : 'secondary'}>{role.active ? t.active : t.inactive}</Badge>
//                     </div>
//                     <p className="mt-1 text-sm text-muted-foreground">{role.description || t.adminNoRoleDescription}</p>
//                 </div>
//                 <div className="text-right"><p className="text-2xl font-semibold">{role.permissions?.length || 0}</p><p
//                     className="text-xs text-muted-foreground">{t.adminRolePermissions}</p></div>
//             </Card>
//             <Card className="w-full min-w-0 gap-0 overflow-hidden shadow-none">
//                 <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
//                     <div>
//                         <h3 className="m-0 text-base font-semibold">{t.adminRolePermissions} <span
//                             className="text-muted-foreground">({role.permissions?.length || 0})</span></h3>
//                         <p className="mt-1 text-xs text-muted-foreground">{t.adminPermissionsGroupedHint}</p>
//                     </div>
//                     <label className="relative w-full sm:w-64"><span
//                         className="sr-only">{t.adminFilterPermissions}</span>
//                         <Search aria-hidden="true"
//                                 className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"/>
//                         <Input type="search" value={keyword} onChange={(event) => setKeyword(event.target.value)}
//                                placeholder={t.adminFilterPermissions} className="h-10 pl-9"/>
//                     </label></div>
//                 {Object.keys(groups).length ? <div
//                         className="space-y-6 p-5">{Object.entries(groups).sort(([a], [b]) => a.localeCompare(b)).map(([service, items]) =>
//                         <section key={service} aria-labelledby={`role-permissions-${service}`}>
//                             <h4 id={`role-permissions-${service}`}
//                                 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{service}
//                                 <span className="font-normal">({items.length})</span></h4>
//                             <ul className="grid list-none grid-cols-1 gap-2 p-0 md:grid-cols-2 xl:grid-cols-3">{items.map((permission) =>
//                                 <li key={permission}
//                                     className="flex min-h-10 items-center rounded-lg border border-border bg-background px-3 py-2 font-mono text-xs text-foreground">{permission}</li>)}</ul>
//                         </section>)}</div> :
//                     <p className="px-5 py-12 text-center text-sm text-muted-foreground">{keyword ? t.adminNoMatchingRolePermissions : t.adminRoleHasNoPermissions}</p>}
//             </Card>
//         </>}
//     </div>
// }
//
// export default function AdminRolesPage({token, t, selectedRoleId, onSelectRole, onBack}) {
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
//     const loadRoles = useCallback(async () => {
//         const currentRequest = ++requestId.current
//         setLoading(true)
//         setError('')
//         const params = {page, size: pageSize, keyword: keyword.trim(), sort: `${sort},${direction}`}
//         if (active !== 'all') params.active = active === 'active'
//         if (type !== 'all') params.system = type === 'builtIn'
//         try {
//             const data = await adminApi.listRoles(token, params)
//             if (requestId.current === currentRequest) setResult(data)
//         } catch (requestError) {
//             if (requestId.current === currentRequest) setError(requestError.status === 403 ? t.adminForbidden : requestError.status === 401 ? t.adminSessionExpired : t.adminRolesLoadError)
//         } finally {
//             if (requestId.current === currentRequest) setLoading(false)
//         }
//     }, [active, direction, keyword, page, sort, t.adminForbidden, t.adminRolesLoadError, t.adminSessionExpired, token, type])
//
//     useEffect(() => {
//         const timer = window.setTimeout(loadRoles, keyword ? 250 : 0)
//         return () => window.clearTimeout(timer)
//     }, [keyword, loadRoles])
//
//     function changeSort(field) {
//         if (sort === field) setDirection((current) => current === 'asc' ? 'desc' : 'asc')
//         else {
//             setSort(field)
//             setDirection('asc')
//         }
//         setPage(0)
//     }
//
//     const total = result?.totalElements || 0
//     const pages = result?.totalPages || 0
//     const start = total ? page * pageSize + 1 : 0
//     const end = Math.min((page + 1) * pageSize, total)
//     const range = t.adminShowingRoles.replace('{start}', String(start)).replace('{end}', String(end)).replace('{total}', String(total))
//
//     if (selectedRoleId) return <RoleDetail token={token} roleId={selectedRoleId} onBack={onBack} t={t}/>
//
//     return <>
//         <section className="mb-5 flex items-center justify-end">
//             <Button onClick={() => setCreateOpen(true)}><Plus className="size-4"/>{t.adminCreateRole}</Button>
//         </section>
//
//         <Card className="w-full min-w-0 gap-0 overflow-hidden shadow-none">
//             <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
//                 <label className="relative min-w-[min(100%,18rem)] flex-1">
//                     <span className="sr-only">{t.adminSearchRoles}</span><Search aria-hidden="true"
//                                                                                  className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"/>
//                     <Input type="search" value={keyword} onChange={(event) => {
//                         setKeyword(event.target.value);
//                         setPage(0)
//                     }} placeholder={t.adminSearchRoles} className="h-10 pl-9"/>
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
//                 <Button variant="outline" size="icon" aria-label={t.refresh} onClick={loadRoles}
//                         disabled={loading}><RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`}/></Button>
//             </div>
//
//             {error && <div role="alert"
//                            className="m-4 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
//                 <CircleAlert className="size-4 shrink-0"/><span className="flex-1">{error}</span>
//                 <button onClick={loadRoles} className="font-semibold underline">{t.retry}</button>
//             </div>}
//
//             <Table>
//                 <TableHeader className="bg-slate-50/80 dark:bg-slate-800/50"><TableRow className="hover:bg-transparent">
//                     <TableHead>
//                         <button onClick={() => changeSort('name')}
//                                 aria-sort={sort === 'name' ? direction === 'asc' ? 'ascending' : 'descending' : 'none'}
//                                 className="inline-flex items-center font-semibold"><SortLabel field="name"
//                                                                                               current={sort}
//                                                                                               direction={direction}>{t.adminRoleName}</SortLabel>
//                         </button>
//                     </TableHead>
//                     <TableHead>{t.adminRoleDescription}</TableHead><TableHead>{t.adminRoleType}</TableHead><TableHead>{t.adminStatus}</TableHead>
//                 </TableRow></TableHeader>
//                 <TableBody>
//                     {loading && !result && Array.from({length: 5}, (_, row) => <TableRow
//                         key={row}>{Array.from({length: 4}, (_, cell) => <TableCell key={cell}>
//                         <div className="h-4 animate-pulse rounded bg-slate-100 dark:bg-slate-800"/>
//                     </TableCell>)}</TableRow>)}
//                     {!loading && !error && !result?.content.length && <TableRow><TableCell colSpan={4}
//                                                                                            className="h-36 text-center text-sm text-slate-500">{keyword || active !== 'all' || type !== 'all' ? t.adminNoMatchingRoles : t.adminNoRolesFound}</TableCell></TableRow>}
//                     {result?.content.map((role) => <TableRow key={role.uuid}>
//                         <TableCell className="min-w-48">
//                             <button type="button" onClick={() => onSelectRole?.(role.uuid)}
//                                     className="flex items-center gap-3 rounded-md text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"><span
//                                 className="grid size-9 place-items-center rounded-lg bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300"><ShieldCheck
//                                 className="size-4"/></span><span
//                                 className="font-semibold tracking-wide hover:text-violet-700 dark:hover:text-violet-300">{role.name}</span>
//                             </button>
//                         </TableCell>
//                         <TableCell
//                             className="min-w-56 max-w-xl text-slate-600 dark:text-slate-300">{role.description || '—'}</TableCell>
//                         <TableCell><Badge
//                             variant="outline">{role.system ? t.adminBuiltIn : t.adminCustom}</Badge></TableCell>
//                         <TableCell><Badge variant={role.active ? 'success' : 'secondary'}><span
//                             className={`size-1.5 rounded-full ${role.active ? 'bg-emerald-500' : 'bg-slate-400'}`}/>{role.active ? t.active : t.inactive}
//                         </Badge></TableCell>
//                     </TableRow>)}
//                 </TableBody>
//             </Table>
//
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
//
//         <CreateRoleDialog open={createOpen} onClose={() => setCreateOpen(false)} onCreated={loadRoles} token={token}
//                           t={t}/>
//     </>
// }


import {useCallback, useEffect, useRef, useState} from 'react'
import {
    ArrowDown,
    ArrowUp,
    ArrowUpDown,
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    CircleAlert,
    Edit,
    Plus,
    Power,
    RefreshCw,
    Search,
    ShieldCheck,
    Trash2
} from 'lucide-react'
import {adminApi} from '../api/adminApi'
import {Badge} from '../../../components/ui/badge'
import {Button} from '../../../components/ui/button'
import {Card} from '../../../components/ui/card'
import {Input} from '../../../components/ui/input'
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '../../../components/ui/table'

const pageSize = 20

function SortLabel({field, current, direction, children}) {
    const Icon = current !== field ? ArrowUpDown : direction === 'asc' ? ArrowUp : ArrowDown
    return <>{children}<Icon aria-hidden="true" className="ml-1 inline size-3.5"/></>
}

function CreateRoleDialog({open, onClose, onCreated, token, t}) {
    const [dialog, setDialog] = useState(null)
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (open && dialog && !dialog.open) dialog.showModal()
        if (!open && dialog?.open) dialog.close()
    }, [dialog, open])

    function close() {
        setName('')
        setDescription('')
        setError('')
        onClose()
    }

    async function submit(event) {
        event.preventDefault()
        setBusy(true)
        setError('')
        try {
            await adminApi.createRole(token, {name: name.trim(), description: description.trim(), permissionUuids: []})
            close()
            onCreated()
        } catch (requestError) {
            setError(requestError.status === 403 ? t.adminForbidden : requestError.status === 409 ? t.adminRoleConflict : t.adminRoleCreateError)
        } finally {
            setBusy(false)
        }
    }

    return (
        <dialog
            ref={setDialog}
            aria-labelledby="create-role-title"
            onCancel={(event) => { event.preventDefault(); close() }}
            onClick={(event) => { if (event.target === dialog) close() }}
            className="fixed left-1/2 top-1/2 m-0 max-h-[min(90dvh,44rem)] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-border bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-950/40 dark:bg-slate-900 dark:text-slate-100"
        >
            <form onSubmit={submit} className="grid gap-5 p-6">
                <header>
                    <h2 id="create-role-title" className="text-lg font-semibold">{t.adminCreateRole}</h2>
                    <p className="mt-1 text-sm text-slate-500">{t.adminCreateRoleHint}</p>
                </header>
                {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">{error}</p>}
                <label className="grid gap-1.5 text-sm font-medium">{t.adminRoleName}
                    <Input autoFocus required minLength={2} maxLength={50} value={name} onChange={(event) => setName(event.target.value)} placeholder={t.adminRoleNamePlaceholder} className="h-10"/>
                </label>
                <label className="grid gap-1.5 text-sm font-medium">{t.adminRoleDescription}
                    <textarea maxLength={255} rows={4} value={description} onChange={(event) => setDescription(event.target.value)} placeholder={t.adminRoleDescriptionPlaceholder} className="resize-y rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring dark:bg-input/30"/>
                </label>
                <p className="rounded-lg bg-slate-50 p-3 text-xs leading-5 text-slate-600 dark:bg-slate-800 dark:text-slate-300">{t.adminRolePermissionsAfterCreate}</p>
                <footer className="flex justify-end gap-2 border-t border-border pt-4">
                    <Button type="button" variant="outline" onClick={close}>{t.cancel}</Button>
                    <Button type="submit" disabled={busy}><Plus className="size-4 mr-2"/>{busy ? t.saving : t.adminCreateRole}</Button>
                </footer>
            </form>
        </dialog>
    )
}

function RoleDetail({token, roleId, onBack, t}) {
    const [role, setRole] = useState(null)
    const [keyword, setKeyword] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        let active = true
        setLoading(true)
        setError('')
        adminApi.getRole(token, roleId).then((data) => {
            if (active) setRole(data)
        }).catch((requestError) => {
            if (active) setError(requestError.status === 403 ? t.adminForbidden : requestError.status === 401 ? t.adminSessionExpired : t.adminRoleDetailLoadError)
        }).finally(() => {
            if (active) setLoading(false)
        })
        return () => { active = false }
    }, [roleId, t, token])

    const permissions = (role?.permissions || []).filter((permission) =>
        permission.toLocaleLowerCase().includes(keyword.trim().toLocaleLowerCase()))
    const groups = permissions.reduce((grouped, permission) => {
        const service = permission.split(':')[0] || t.adminOtherGroup
        grouped[service] = [...(grouped[service] || []), permission]
        return grouped
    }, {})

    return (
        <div className="space-y-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <Button variant="ghost" onClick={onBack} className="-ml-2">
                    <ArrowLeft className="size-4 mr-2"/>{t.adminBackToRoles}
                </Button>
                {/* Added Role Management Actions */}
                {!loading && role && (
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                            <Edit className="size-4 mr-2"/> Edit
                        </Button>
                        <Button variant={role.active ? "outline" : "default"} size="sm">
                            <Power className="size-4 mr-2"/> {role.active ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button variant="destructive" size="sm">
                            <Trash2 className="size-4 mr-2"/> Delete
                        </Button>
                    </div>
                )}
            </div>

            {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">{error}</div>}

            {loading ? (
                <Card className="space-y-4 p-6 shadow-none">
                    <div className="h-5 w-40 animate-pulse rounded bg-slate-100 dark:bg-slate-800"/>
                    <div className="h-10 w-full animate-pulse rounded bg-slate-100 dark:bg-slate-800"/>
                    <div className="h-48 w-full animate-pulse rounded bg-slate-100 dark:bg-slate-800"/>
                </Card>
            ) : !error && role && (
                <>
                    <Card className="flex flex-wrap items-center gap-4 p-5 shadow-none">
                        <span className="grid size-12 place-items-center rounded-xl bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                            <ShieldCheck className="size-5"/>
                        </span>
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 className="m-0 text-xl font-semibold">{role.name}</h2>
                                <Badge variant="outline">{role.system ? t.adminBuiltIn : t.adminCustom}</Badge>
                                <Badge variant={role.active ? 'success' : 'secondary'}>{role.active ? t.active : t.inactive}</Badge>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">{role.description || t.adminNoRoleDescription}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-semibold">{role.permissions?.length || 0}</p>
                            <p className="text-xs text-muted-foreground">{t.adminRolePermissions}</p>
                        </div>
                    </Card>

                    <Card className="w-full min-w-0 gap-0 overflow-hidden shadow-none">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
                            <div>
                                <h3 className="m-0 text-base font-semibold">{t.adminRolePermissions} <span className="text-muted-foreground">({role.permissions?.length || 0})</span></h3>
                                <p className="mt-1 text-xs text-muted-foreground">{t.adminPermissionsGroupedHint}</p>
                            </div>
                            <label className="relative w-full sm:w-64">
                                <span className="sr-only">{t.adminFilterPermissions}</span>
                                <Search aria-hidden="true" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"/>
                                <Input type="search" value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder={t.adminFilterPermissions} className="h-10 pl-9"/>
                            </label>
                        </div>
                        {Object.keys(groups).length ? (
                            <div className="space-y-6 p-5">
                                {Object.entries(groups).sort(([a], [b]) => a.localeCompare(b)).map(([service, items]) => (
                                    <section key={service} aria-labelledby={`role-permissions-${service}`}>
                                        <h4 id={`role-permissions-${service}`} className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            {service} <span className="font-normal">({items.length})</span>
                                        </h4>
                                        <ul className="grid list-none grid-cols-1 gap-2 p-0 md:grid-cols-2 xl:grid-cols-3">
                                            {items.map((permission) => (
                                                <li key={permission} className="flex min-h-10 items-center justify-between rounded-lg border border-border bg-background px-3 py-2 font-mono text-xs text-foreground">
                                                    <span>{permission}</span>
                                                    {/* Row action to revoke permission from role */}
                                                    <Button size="icon" variant="ghost" className="h-6 w-6 text-red-500 hover:bg-red-50 hover:text-red-700">
                                                        <Trash2 className="size-3"/>
                                                    </Button>
                                                </li>
                                            ))}
                                        </ul>
                                    </section>
                                ))}
                            </div>
                        ) : (
                            <p className="px-5 py-12 text-center text-sm text-muted-foreground">{keyword ? t.adminNoMatchingRolePermissions : t.adminRoleHasNoPermissions}</p>
                        )}
                    </Card>
                </>
            )}
        </div>
    )
}

export default function AdminRolesPage({token, t, selectedRoleId, onSelectRole, onBack}) {
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

    const loadRoles = useCallback(async () => {
        const currentRequest = ++requestId.current
        setLoading(true)
        setError('')
        const params = {page, size: pageSize, keyword: keyword.trim(), sort: `${sort},${direction}`}
        if (active !== 'all') params.active = active === 'active'
        if (type !== 'all') params.system = type === 'builtIn'
        try {
            const data = await adminApi.listRoles(token, params)
            if (requestId.current === currentRequest) setResult(data)
        } catch (requestError) {
            if (requestId.current === currentRequest) setError(requestError.status === 403 ? t.adminForbidden : requestError.status === 401 ? t.adminSessionExpired : t.adminRolesLoadError)
        } finally {
            if (requestId.current === currentRequest) setLoading(false)
        }
    }, [active, direction, keyword, page, sort, t, token, type])

    useEffect(() => {
        const timer = window.setTimeout(loadRoles, keyword ? 250 : 0)
        return () => window.clearTimeout(timer)
    }, [keyword, loadRoles])

    function changeSort(field) {
        if (sort === field) setDirection((current) => current === 'asc' ? 'desc' : 'asc')
        else {
            setSort(field)
            setDirection('asc')
        }
        setPage(0)
    }

    const total = result?.totalElements || 0
    const pages = result?.totalPages || 0
    const start = total ? page * pageSize + 1 : 0
    const end = Math.min((page + 1) * pageSize, total)
    const range = t.adminShowingRoles.replace('{start}', String(start)).replace('{end}', String(end)).replace('{total}', String(total))

    if (selectedRoleId) return <RoleDetail token={token} roleId={selectedRoleId} onBack={onBack} t={t}/>

    return (
        <>
            <section className="mb-5 flex items-center justify-end">
                <Button onClick={() => setCreateOpen(true)}><Plus className="size-4 mr-2"/>{t.adminCreateRole}</Button>
            </section>

            <Card className="w-full min-w-0 gap-0 overflow-hidden shadow-none">
                <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
                    <label className="relative min-w-[min(100%,18rem)] flex-1">
                        <span className="sr-only">{t.adminSearchRoles}</span>
                        <Search aria-hidden="true" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"/>
                        <Input type="search" value={keyword} onChange={(event) => { setKeyword(event.target.value); setPage(0) }} placeholder={t.adminSearchRoles} className="h-10 pl-9"/>
                    </label>
                    <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"><span>{t.adminStatus}</span>
                        <select value={active} onChange={(event) => { setActive(event.target.value); setPage(0) }} className="h-10 min-w-36 rounded-lg border border-input bg-white px-3 text-sm dark:bg-slate-950">
                            <option value="all">{t.adminAllStatuses}</option>
                            <option value="active">{t.active}</option>
                            <option value="inactive">{t.inactive}</option>
                        </select>
                    </label>
                    <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"><span>{t.adminRoleType}</span>
                        <select value={type} onChange={(event) => { setType(event.target.value); setPage(0) }} className="h-10 min-w-36 rounded-lg border border-input bg-white px-3 text-sm dark:bg-slate-950">
                            <option value="all">{t.adminAllTypes}</option>
                            <option value="builtIn">{t.adminBuiltIn}</option>
                            <option value="custom">{t.adminCustom}</option>
                        </select>
                    </label>
                    <Button variant="outline" size="icon" aria-label={t.refresh} onClick={loadRoles} disabled={loading}>
                        <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`}/>
                    </Button>
                </div>

                {error && (
                    <div role="alert" className="m-4 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
                        <CircleAlert className="size-4 shrink-0"/><span className="flex-1">{error}</span>
                        <button onClick={loadRoles} className="font-semibold underline">{t.retry}</button>
                    </div>
                )}

                <Table>
                    <TableHeader className="bg-slate-50/80 dark:bg-slate-800/50">
                        <TableRow className="hover:bg-transparent">
                            <TableHead>
                                <button onClick={() => changeSort('name')} aria-sort={sort === 'name' ? direction === 'asc' ? 'ascending' : 'descending' : 'none'} className="inline-flex items-center font-semibold">
                                    <SortLabel field="name" current={sort} direction={direction}>{t.adminRoleName}</SortLabel>
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
                        {loading && !result && Array.from({length: 5}, (_, row) => (
                            <TableRow key={row}>
                                {Array.from({length: 5}, (_, cell) => (
                                    <TableCell key={cell}><div className="h-4 animate-pulse rounded bg-slate-100 dark:bg-slate-800"/></TableCell>
                                ))}
                            </TableRow>
                        ))}
                        {!loading && !error && !result?.content.length && (
                            <TableRow>
                                <TableCell colSpan={5} className="h-36 text-center text-sm text-slate-500">
                                    {keyword || active !== 'all' || type !== 'all' ? t.adminNoMatchingRoles : t.adminNoRolesFound}
                                </TableCell>
                            </TableRow>
                        )}
                        {result?.content.map((role) => (
                            <TableRow key={role.uuid}>
                                <TableCell className="min-w-48">
                                    <button type="button" onClick={() => onSelectRole?.(role.uuid)} className="flex items-center gap-3 rounded-md text-left outline-none focus-visible:ring-2 focus-visible:ring-ring">
                                        <span className="grid size-9 place-items-center rounded-lg bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                                            <ShieldCheck className="size-4"/>
                                        </span>
                                        <span className="font-semibold tracking-wide hover:text-violet-700 dark:hover:text-violet-300">{role.name}</span>
                                    </button>
                                </TableCell>
                                <TableCell className="min-w-56 max-w-xl text-slate-600 dark:text-slate-300">{role.description || '—'}</TableCell>
                                <TableCell><Badge variant="outline">{role.system ? t.adminBuiltIn : t.adminCustom}</Badge></TableCell>
                                <TableCell>
                                    <Badge variant={role.active ? 'success' : 'secondary'}>
                                        <span className={`size-1.5 rounded-full ${role.active ? 'bg-emerald-500' : 'bg-slate-400'}`}/>{role.active ? t.active : t.inactive}
                                    </Badge>
                                </TableCell>
                                {/* Added Row Actions */}
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-1">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-violet-600">
                                            <Edit className="size-4"/>
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-700">
                                            <Trash2 className="size-4"/>
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3">
                    <p aria-live="polite" className="text-xs text-slate-500">{loading ? t.loading : range}</p>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">{t.adminPageOf.replace('{page}', String(pages ? page + 1 : 0)).replace('{pages}', String(pages))}</span>
                        <Button variant="outline" size="sm" onClick={() => setPage((current) => Math.max(0, current - 1))} disabled={page === 0 || loading}>
                            <ChevronLeft className="size-4"/>{t.adminPreviousPage}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setPage((current) => Math.min(pages - 1, current + 1))} disabled={!pages || page >= pages - 1 || loading}>
                            {t.adminNextPage}<ChevronRight className="size-4"/>
                        </Button>
                    </div>
                </footer>
            </Card>

            <CreateRoleDialog open={createOpen} onClose={() => setCreateOpen(false)} onCreated={loadRoles} token={token} t={t}/>
        </>
    )
}