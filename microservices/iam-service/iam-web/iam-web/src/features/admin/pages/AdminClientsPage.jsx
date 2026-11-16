// import {useEffect, useState} from 'react'
// import {
//     Layers,
//     Plus,
//     Search,
//     RefreshCw,
//     Check,
//     Copy,
//     Eye,
//     EyeOff,
//     Trash2,
//     Edit,
//     KeyRound,
//     Globe,
//     Shield,
//     ExternalLink,
//     AlertCircle,
//     Sliders
// } from 'lucide-react'
// import {adminApi} from '../api/adminApi'
// import CreateClientDialog from '../components/CreateClientDialog'
// import {clientSchema, validateForm} from '../../../utils/validation'
// import {Badge} from '../../../components/ui/badge'
// import {Button} from '../../../components/ui/button'
// import {Card} from '../../../components/ui/card'
// import {Input} from '../../../components/ui/input'
// import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '../../../components/ui/table'
//
// const AVAILABLE_SCOPES = ['openid', 'profile', 'email', 'phone', 'address', 'read', 'write']
// const AVAILABLE_GRANT_TYPES = [
//     {id: 'authorization_code', label: 'Authorization Code'},
//     {id: 'refresh_token', label: 'Refresh Token'},
//     {id: 'client_credentials', label: 'Client Credentials'},
// ]
//
// function toList(val) {
//     if (Array.isArray(val)) return val
//     if (typeof val === 'string' && val.trim()) return val.split(',').map((s) => s.trim()).filter(Boolean)
//     return []
// }
//
// function ClientDetailModal({open, onClose, client, onRegenerate, locale}) {
//     const [showSecret, setShowSecret] = useState(false)
//     const [copied, setCopied] = useState(false)
//
//     if (!open || !client) return null
//
//     function copyToClipboard(text) {
//         navigator.clipboard.writeText(text)
//         setCopied(true)
//         setTimeout(() => setCopied(false), 2000)
//     }
//
//     return (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
//             <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 my-auto animate-in zoom-in-95 duration-150">
//                 <header className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
//                     <div className="flex items-center gap-2">
//                         <Layers className="size-5 text-violet-600" />
//                         <h3 className="text-base font-bold text-slate-900 dark:text-white">{client.clientName}</h3>
//                     </div>
//                     <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
//                 </header>
//
//                 <div className="mt-4 grid gap-4 text-xs">
//                     {/* Credentials Box */}
//                     <div className="rounded-xl border border-violet-100 bg-violet-50/50 p-4 dark:border-violet-900 dark:bg-violet-950/30 space-y-3">
//                         <div>
//                             <span className="text-[11px] font-bold text-slate-500 uppercase">Client ID</span>
//                             <div className="mt-1 flex items-center justify-between rounded-lg bg-white p-2 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 font-mono text-xs">
//                                 <span>{client.clientId}</span>
//                                 <button
//                                     onClick={() => copyToClipboard(client.clientId)}
//                                     className="text-violet-600 hover:text-violet-800"
//                                 >
//                                     <Copy className="size-3.5" />
//                                 </button>
//                             </div>
//                         </div>
//
//                         {client.clientSecret && (
//                             <div>
//                                 <div className="flex items-center justify-between">
//                                     <span className="text-[11px] font-bold text-slate-500 uppercase">Client Secret</span>
//                                     <button
//                                         type="button"
//                                         onClick={() => setShowSecret(!showSecret)}
//                                         className="text-[11px] text-slate-400 hover:text-slate-600"
//                                     >
//                                         {showSecret ? 'Hide' : 'Reveal'}
//                                     </button>
//                                 </div>
//                                 <div className="mt-1 flex items-center justify-between rounded-lg bg-white p-2 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 font-mono text-xs">
//                                     <span>{showSecret ? client.clientSecret : '••••••••••••••••••••••••'}</span>
//                                     <div className="flex items-center gap-2">
//                                         <button
//                                             onClick={() => copyToClipboard(client.clientSecret)}
//                                             className="text-violet-600 hover:text-violet-800"
//                                         >
//                                             <Copy className="size-3.5" />
//                                         </button>
//                                     </div>
//                                 </div>
//                             </div>
//                         )}
//
//                         <div className="flex justify-end">
//                             <Button
//                                 size="xs"
//                                 variant="outline"
//                                 onClick={() => onRegenerate(client.id)}
//                                 className="text-[11px] border-violet-300 text-violet-700"
//                             >
//                                 <KeyRound className="size-3 mr-1" />
//                                 Regenerate Secret
//                             </Button>
//                         </div>
//                     </div>
//
//                     {copied && (
//                         <div className="rounded-lg bg-emerald-50 p-2 text-center text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
//                             Copied to clipboard!
//                         </div>
//                     )}
//
//                     <div className="grid grid-cols-2 gap-3">
//                         <div>
//                             <span className="text-slate-400 font-medium">Authentication</span>
//                             <p className="font-mono mt-0.5">{client.clientAuthenticationMethods?.join(', ')}</p>
//                         </div>
//                         <div>
//                             <span className="text-slate-400 font-medium">PKCE Policy</span>
//                             <p className="mt-0.5 font-semibold text-emerald-600">
//                                 {client.requireProofKey ? 'Required (S256)' : 'Optional'}
//                             </p>
//                         </div>
//                     </div>
//
//                     <div>
//                         <span className="text-slate-400 font-medium">Grant Types</span>
//                         <div className="flex flex-wrap gap-1 mt-1">
//                             {toList(client.authorizationGrantTypes || client.grantTypes).map((gt) => (
//                                 <Badge key={gt} variant="outline" className="text-[10px] font-mono">
//                                     {gt}
//                                 </Badge>
//                             ))}
//                         </div>
//                     </div>
//
//                     <div>
//                         <span className="text-slate-400 font-medium">Redirect URIs</span>
//                         <ul className="mt-1 space-y-1 font-mono text-[11px] text-slate-700 dark:text-slate-300">
//                             {toList(client.redirectUris).map((uri) => (
//                                 <li key={uri} className="truncate">• {uri}</li>
//                             ))}
//                         </ul>
//                     </div>
//
//                     <div>
//                         <span className="text-slate-400 font-medium">Scopes</span>
//                         <div className="flex flex-wrap gap-1 mt-1">
//                             {toList(client.scopes).map((sc) => (
//                                 <Badge key={sc} variant="secondary" className="text-[10px] font-mono">
//                                     {sc}
//                                 </Badge>
//                             ))}
//                         </div>
//                     </div>
//
//                     <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
//                         <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     )
// }
//
// export default function AdminClientsPage({locale, t, initialCreateOpen}) {
//     const [clients, setClients] = useState([])
//     const [loading, setLoading] = useState(true)
//     const [search, setSearch] = useState('')
//     const [createOpen, setCreateOpen] = useState(() => Boolean(initialCreateOpen || new URLSearchParams(window.location.search).get('action') === 'create'))
//     const [selectedClient, setSelectedClient] = useState(null)
//     const [notice, setNotice] = useState('')
//
//     async function loadClients() {
//         setLoading(true)
//         try {
//             const data = await adminApi.listClients()
//             setClients(data)
//         } finally {
//             setLoading(false)
//         }
//     }
//
//     useEffect(() => {
//         loadClients()
//     }, [])
//
//     useEffect(() => {
//         if (initialCreateOpen) setCreateOpen(true)
//     }, [initialCreateOpen])
//
//     function notify(msg) {
//         setNotice(msg)
//         setTimeout(() => setNotice(''), 3500)
//     }
//
//     async function handleDelete(client) {
//         if (!window.confirm(`Delete OAuth2 client "${client.clientName}" (${client.clientId})?`)) return
//         await adminApi.deleteClient(client.id)
//         notify(`Deleted client ${client.clientName}`)
//         loadClients()
//     }
//
//     async function handleRegenerateSecret(id) {
//         const newSecret = await adminApi.regenerateClientSecret(id)
//         notify('Client secret regenerated')
//         loadClients()
//         setSelectedClient((curr) => (curr ? {...curr, clientSecret: newSecret} : null))
//     }
//
//     const filtered = (clients || []).filter(
//         (c) =>
//             (c.clientName || '').toLowerCase().includes(search.toLowerCase()) ||
//             (c.clientId || '').toLowerCase().includes(search.toLowerCase())
//     )
//
//     return (
//         <div className="grid gap-6">
//             <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
//                 <div>
//                     <h2 className="text-lg font-medium text-slate-900 dark:text-white">
//                         {locale === 'km' ? 'ការគ្រប់គ្រងអតិថិជន OAuth2 / OIDC' : 'OAuth2 / OIDC Clients'}
//                     </h2>
//                     <p className="text-xs text-slate-500">
//                         {locale === 'km'
//                             ? 'ចុះឈ្មោះ និងគ្រប់គ្រងកម្មវិធីដែលបានភ្ជាប់, អត្តសញ្ញាណប័ណ្ណ និងសិទ្ធិ Scopes'
//                             : 'Register, configure credentials, grant types, redirect URIs, and scopes for OAuth2/OIDC applications.'}
//                     </p>
//                 </div>
//                 <div className="flex items-center gap-2">
//                     <Button variant="outline" size="sm" onClick={loadClients} disabled={loading}>
//                         <RefreshCw className={`size-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
//                         {t.refresh || 'Refresh'}
//                     </Button>
//                     <Button
//                         size="sm"
//                         onClick={() => setCreateOpen(true)}
//                         className="bg-violet-700 hover:bg-violet-800 text-white font-semibold text-xs"
//                     >
//                         <Plus className="size-4 mr-1" />
//                         {locale === 'km' ? 'ចុះឈ្មោះអតិថិជន' : 'Register Client'}
//                     </Button>
//                 </div>
//             </div>
//
//             {notice && (
//                 <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
//                     <Check className="size-4" />
//                     <span>{notice}</span>
//                 </div>
//             )}
//
//             <Card className="gap-0 overflow-hidden shadow-none">
//                 <div className="flex items-center justify-between border-b border-slate-100 p-4 dark:border-slate-800">
//                     <div className="relative w-full sm:w-72">
//                         <Search className="absolute left-3 top-2.5 size-3.5 text-slate-400" />
//                         <Input
//                             placeholder="Search client by name or ID…"
//                             value={search}
//                             onChange={(e) => setSearch(e.target.value)}
//                             className="h-8 pl-8 text-xs"
//                         />
//                     </div>
//                     <Badge variant="outline" className="text-xs">
//                         {filtered.length} {locale === 'km' ? 'អតិថិជន' : 'Clients'}
//                     </Badge>
//                 </div>
//
//                 <Table>
//                     <TableHeader className="bg-slate-50/80 dark:bg-slate-800/50">
//                         <TableRow>
//                             <TableHead className="text-xs font-bold">Client Name</TableHead>
//                             <TableHead className="text-xs font-bold">Client ID</TableHead>
//                             <TableHead className="text-xs font-bold">Grant Types</TableHead>
//                             <TableHead className="text-xs font-bold">Scopes</TableHead>
//                             <TableHead className="text-xs font-bold">PKCE</TableHead>
//                             <TableHead className="text-right text-xs font-bold">Actions</TableHead>
//                         </TableRow>
//                     </TableHeader>
//                     <TableBody>
//                         {filtered.map((client) => (
//                             <TableRow key={client.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
//                                 <TableCell>
//                                     <button
//                                         type="button"
//                                         onClick={() => setSelectedClient(client)}
//                                         className="flex items-center gap-2.5 font-bold text-xs text-slate-900 hover:text-violet-700 dark:text-white dark:hover:text-violet-300"
//                                     >
//                                         <span className="grid size-7 place-items-center rounded-lg bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
//                                             <Layers className="size-4" />
//                                         </span>
//                                         <span>{client.clientName}</span>
//                                     </button>
//                                 </TableCell>
//                                 <TableCell className="font-mono text-xs text-slate-600 dark:text-slate-300">
//                                     {client.clientId}
//                                 </TableCell>
//                                 <TableCell>
//                                     <div className="flex flex-wrap gap-1 max-w-xs">
//                                         {toList(client.authorizationGrantTypes || client.grantTypes).map((gt) => (
//                                             <Badge key={gt} variant="outline" className="text-[9px]">
//                                                 {gt}
//                                             </Badge>
//                                         ))}
//                                     </div>
//                                 </TableCell>
//                                 <TableCell>
//                                     <div className="flex flex-wrap gap-1 max-w-xs">
//                                         {toList(client.scopes).slice(0, 3).map((sc) => (
//                                             <Badge key={sc} variant="secondary" className="text-[9px] font-mono">
//                                                 {sc}
//                                             </Badge>
//                                         ))}
//                                         {toList(client.scopes).length > 3 && (
//                                             <span className="text-[10px] text-slate-400">
//                                                 +{toList(client.scopes).length - 3}
//                                             </span>
//                                         )}
//                                     </div>
//                                 </TableCell>
//                                 <TableCell>
//                                     <Badge variant={client.requireProofKey ? 'success' : 'outline'} className="text-[9px]">
//                                         {client.requireProofKey ? 'Enforced' : 'Optional'}
//                                     </Badge>
//                                 </TableCell>
//                                 <TableCell className="text-right">
//                                     <div className="flex items-center justify-end gap-1">
//                                         <Button
//                                             variant="ghost"
//                                             size="xs"
//                                             onClick={() => setSelectedClient(client)}
//                                             className="text-slate-600 hover:text-violet-700"
//                                         >
//                                             <KeyRound className="size-3.5" />
//                                         </Button>
//                                         <Button
//                                             variant="ghost"
//                                             size="xs"
//                                             onClick={() => handleDelete(client)}
//                                             className="text-red-500 hover:bg-red-50 hover:text-red-700"
//                                         >
//                                             <Trash2 className="size-3.5" />
//                                         </Button>
//                                     </div>
//                                 </TableCell>
//                             </TableRow>
//                         ))}
//
//                         {filtered.length === 0 && (
//                             <TableRow>
//                                 <TableCell colSpan={6} className="h-32 text-center text-xs text-slate-400">
//                                     No OAuth2 clients match your search.
//                                 </TableCell>
//                             </TableRow>
//                         )}
//                     </TableBody>
//                 </Table>
//             </Card>
//
//             <CreateClientDialog
//                 open={createOpen}
//                 onClose={() => setCreateOpen(false)}
//                 onCreated={() => {
//                     notify('OAuth2 client registered successfully')
//                     loadClients()
//                 }}
//                 locale={locale}
//             />
//
//             <ClientDetailModal
//                 open={!!selectedClient}
//                 onClose={() => setSelectedClient(null)}
//                 client={selectedClient}
//                 onRegenerate={handleRegenerateSecret}
//                 locale={locale}
//             />
//         </div>
//     )
// }


import {useEffect, useRef, useState} from 'react'
import {Check, Copy, Eye, EyeOff, Info, KeyRound, Layers, LoaderCircle, Plus, RefreshCw, Search, Trash2, TriangleAlert, X} from 'lucide-react'
import {adminApi} from '../api/adminApi'
import CreateClientDialog from '../components/CreateClientDialog'
import {Badge} from '../../../components/ui/badge'
import {Button} from '../../../components/ui/button'
import {Card} from '../../../components/ui/card'
import {Input} from '../../../components/ui/input'
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '../../../components/ui/table'

function toList(val) {
    if (Array.isArray(val)) return val
    if (typeof val === 'string' && val.trim()) return val.split(',').map((s) => s.trim()).filter(Boolean)
    return []
}

// The server stores secrets as bcrypt hashes. A hash is not the secret, so it must never
// be shown or copied as if it were. A plain secret only exists right after regenerating.
const isHashed = (secret) => /^\$2[aby]\$\d{2}\$/.test(secret || '')

function CopyButton({value, label}) {
    const [copied, setCopied] = useState(false)

    async function copy() {
        try {
            await navigator.clipboard.writeText(value)
            setCopied(true)
            setTimeout(() => setCopied(false), 1800)
        } catch {
            // Clipboard can be blocked (insecure context / permissions): fail quietly
        }
    }

    return (
        <button
            type="button"
            onClick={copy}
            aria-label={copied ? `${label} copied` : `Copy ${label}`}
            className="grid size-7 shrink-0 cursor-pointer place-items-center rounded-md text-violet-700 hover:bg-violet-50 focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:outline-none dark:text-violet-300 dark:hover:bg-violet-950"
        >
            {copied
                ? <Check aria-hidden="true" className="size-3.5 text-emerald-600"/>
                : <Copy aria-hidden="true" className="size-3.5"/>}
            <span role="status" className="sr-only">{copied ? 'Copied' : ''}</span>
        </button>
    )
}

function Field({label, children}) {
    return (
        <div className="grid min-w-0 gap-1">
            <dt className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{label}</dt>
            <dd className="min-w-0 text-xs">{children}</dd>
        </div>
    )
}

function ClientDetailDialog({client, onClose, onRegenerate, t}) {
    const dialogRef = useRef(null)
    const [showSecret, setShowSecret] = useState(false)
    const [regenerating, setRegenerating] = useState(false)
    const open = Boolean(client)

    useEffect(() => {
        const dialog = dialogRef.current
        if (!dialog) return
        if (open && !dialog.open) dialog.showModal()
        if (!open && dialog.open) dialog.close()
    }, [open])

    // Never carry "revealed" over to another client
    useEffect(() => {
        setShowSecret(false)
    }, [client?.id])

    async function regenerate() {
        if (regenerating) return
        if (!window.confirm(t.adminRegenerateConfirm || 'Regenerate the secret? Applications using the old secret will stop working.')) return
        setRegenerating(true)
        try {
            await onRegenerate(client.id)
            setShowSecret(true)
        } finally {
            setRegenerating(false)
        }
    }

    const secret = client?.clientSecret
    const hasPlainSecret = Boolean(secret) && !isHashed(secret)
    const grantTypes = client ? toList(client.authorizationGrantTypes || client.grantTypes) : []
    const redirectUris = client ? toList(client.redirectUris) : []
    const scopes = client ? toList(client.scopes) : []

    return (
        <dialog
            ref={dialogRef}
            aria-labelledby="client-detail-title"
            onCancel={(event) => {
                event.preventDefault()
                onClose()
            }}
            onClick={(event) => {
                if (event.target === dialogRef.current) onClose()
            }}
            className="m-auto max-h-[calc(100dvh-2rem)] w-full max-w-xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-xs open:animate-in open:fade-in open:zoom-in-95 open:duration-150 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
        >
            {client && (
                <div className="grid gap-4 p-6">
                    <header className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
                        <div className="flex min-w-0 items-center gap-2">
                            <Layers aria-hidden="true" className="size-5 shrink-0 text-violet-700 dark:text-violet-400"/>
                            <h2 id="client-detail-title" className="truncate text-base font-semibold">
                                {client.clientName}
                            </h2>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label={t.close || 'Close'}
                            className="cursor-pointer rounded-md p-1 text-slate-400 hover:text-slate-600 focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:outline-none dark:hover:text-slate-200"
                        >
                            <X aria-hidden="true" className="size-4"/>
                        </button>
                    </header>

                    {/* Credentials */}
                    <section
                        aria-label={t.adminCredentials || 'Credentials'}
                        className="grid gap-3 rounded-xl border border-violet-100 bg-violet-50/50 p-4 dark:border-violet-900 dark:bg-violet-950/30"
                    >
                        <div className="grid min-w-0 gap-1">
                            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                                {t.adminClientId || 'Client ID'}
                            </span>
                            <div className="flex min-w-0 items-center gap-1 rounded-lg border border-slate-200 bg-white py-1 pr-1 pl-3 dark:border-slate-800 dark:bg-slate-900">
                                <code className="min-w-0 flex-1 break-all font-mono text-xs">{client.clientId}</code>
                                <CopyButton value={client.clientId} label="client ID"/>
                            </div>
                        </div>

                        <div className="grid min-w-0 gap-1">
                            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                                {t.adminClientSecret || 'Client secret'}
                            </span>

                            {hasPlainSecret ? (
                                <>
                                    <div className="flex min-w-0 items-center gap-1 rounded-lg border border-slate-200 bg-white py-1 pr-1 pl-3 dark:border-slate-800 dark:bg-slate-900">
                                        <code className="min-w-0 flex-1 break-all font-mono text-xs">
                                            {showSecret ? secret : '•'.repeat(24)}
                                        </code>
                                        <button
                                            type="button"
                                            onClick={() => setShowSecret((current) => !current)}
                                            aria-label={showSecret ? 'Hide secret' : 'Reveal secret'}
                                            aria-pressed={showSecret}
                                            className="grid size-7 shrink-0 cursor-pointer place-items-center rounded-md text-slate-500 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:outline-none dark:hover:bg-slate-800"
                                        >
                                            {showSecret
                                                ? <EyeOff aria-hidden="true" className="size-3.5"/>
                                                : <Eye aria-hidden="true" className="size-3.5"/>}
                                        </button>
                                        <CopyButton value={secret} label="client secret"/>
                                    </div>
                                    <p className="flex items-start gap-1.5 text-[11px] text-amber-800 dark:text-amber-300">
                                        <TriangleAlert aria-hidden="true" className="mt-px size-3.5 shrink-0"/>
                                        {t.adminSecretOnce || 'Copy this secret now. It will not be shown again.'}
                                    </p>
                                </>
                            ) : (
                                <p className="flex items-start gap-1.5 rounded-lg border border-slate-200 bg-white p-3 text-[11px] text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                                    <Info aria-hidden="true" className="mt-px size-3.5 shrink-0"/>
                                    {secret
                                        ? (t.adminSecretHashed || 'The secret is stored hashed and cannot be shown. Regenerate it to get a new one.')
                                        : (t.adminNoSecret || 'This client has no secret (public client).')}
                                </p>
                            )}
                        </div>

                        {Boolean(secret) && (
                            <div className="flex justify-end">
                                <Button
                                    type="button"
                                    size="xs"
                                    variant="outline"
                                    onClick={regenerate}
                                    disabled={regenerating}
                                    className="border-violet-300 text-[11px] text-violet-700"
                                >
                                    {regenerating
                                        ? <LoaderCircle aria-hidden="true" className="mr-1 size-3 animate-spin"/>
                                        : <KeyRound aria-hidden="true" className="mr-1 size-3"/>}
                                    {t.adminRegenerateSecret || 'Regenerate secret'}
                                </Button>
                            </div>
                        )}
                    </section>

                    <dl className="grid gap-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[repeat(2,minmax(0,1fr))]">
                            <Field label={t.adminAuthMethod || 'Authentication method'}>
                                <span className="font-mono">{client.clientAuthenticationMethods?.join(', ') || '-'}</span>
                            </Field>
                            <Field label={t.adminPkcePolicy || 'PKCE'}>
                                <span className={client.requireProofKey ? 'font-semibold text-emerald-700 dark:text-emerald-400' : ''}>
                                    {client.requireProofKey
                                        ? (t.adminPkceRequired || 'Required (S256)')
                                        : (t.adminPkceOptional || 'Optional')}
                                </span>
                            </Field>
                        </div>

                        <Field label={t.adminGrantTypes || 'Grant types'}>
                            <div className="flex flex-wrap gap-1">
                                {grantTypes.map((grant) => (
                                    <Badge key={grant} variant="outline" className="font-mono text-[10px]">{grant}</Badge>
                                ))}
                            </div>
                        </Field>

                        <Field label={t.adminRedirectUris || 'Redirect URIs'}>
                            <ul className="grid gap-1 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                                {redirectUris.map((uri) => (
                                    <li key={uri} className="break-all">{uri}</li>
                                ))}
                            </ul>
                        </Field>

                        <Field label={t.adminScopes || 'Scopes'}>
                            <div className="flex flex-wrap gap-1">
                                {scopes.map((scope) => (
                                    <Badge key={scope} variant="secondary" className="font-mono text-[10px]">{scope}</Badge>
                                ))}
                            </div>
                        </Field>
                    </dl>

                    <footer className="flex justify-end border-t border-slate-100 pt-3 dark:border-slate-800">
                        <Button variant="outline" size="sm" onClick={onClose}>{t.close || 'Close'}</Button>
                    </footer>
                </div>
            )}
        </dialog>
    )
}

export default function AdminClientsPage({locale, t = {}, initialCreateOpen}) {
    const [clients, setClients] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [createOpen, setCreateOpen] = useState(() => Boolean(initialCreateOpen || new URLSearchParams(window.location.search).get('action') === 'create'))
    const [selectedClient, setSelectedClient] = useState(null)
    const [notice, setNotice] = useState('')

    async function loadClients() {
        setLoading(true)
        try {
            const data = await adminApi.listClients()
            setClients(data)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadClients()
    }, [])

    useEffect(() => {
        if (initialCreateOpen) setCreateOpen(true)
    }, [initialCreateOpen])

    function notify(msg) {
        setNotice(msg)
        setTimeout(() => setNotice(''), 3500)
    }

    async function handleDelete(client) {
        if (!window.confirm(`Delete OAuth2 client "${client.clientName}" (${client.clientId})?`)) return
        await adminApi.deleteClient(client.id)
        notify(`Deleted client ${client.clientName}`)
        loadClients()
    }

    async function handleRegenerateSecret(id) {
        try {
            const newSecret = await adminApi.regenerateClientSecret(id)
            notify('Client secret regenerated')
            loadClients()
            setSelectedClient((curr) => (curr ? {...curr, clientSecret: newSecret} : null))
        } catch {
            notify('Failed to regenerate the secret')
        }
    }

    const filtered = (clients || []).filter(
        (c) =>
            (c.clientName || '').toLowerCase().includes(search.toLowerCase()) ||
            (c.clientId || '').toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="grid gap-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-lg font-medium text-slate-900 dark:text-white">
                        {locale === 'km' ? 'ការគ្រប់គ្រងអតិថិជន OAuth2 / OIDC' : 'OAuth2 / OIDC Clients'}
                    </h2>
                    <p className="text-xs text-slate-500">
                        {locale === 'km'
                            ? 'ចុះឈ្មោះ និងគ្រប់គ្រងកម្មវិធីដែលបានភ្ជាប់, អត្តសញ្ញាណប័ណ្ណ និងសិទ្ធិ Scopes'
                            : 'Register, configure credentials, grant types, redirect URIs, and scopes for OAuth2/OIDC applications.'}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={loadClients} disabled={loading}>
                        <RefreshCw className={`size-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
                        {t.refresh || 'Refresh'}
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => setCreateOpen(true)}
                        className="bg-violet-700 hover:bg-violet-800 text-white font-semibold text-xs"
                    >
                        <Plus className="size-4 mr-1" />
                        {locale === 'km' ? 'ចុះឈ្មោះអតិថិជន' : 'Register Client'}
                    </Button>
                </div>
            </div>

            {notice && (
                <div
                    role="status"
                    className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
                >
                    <Check aria-hidden="true" className="size-4" />
                    <span>{notice}</span>
                </div>
            )}

            <Card className="gap-0 overflow-hidden shadow-none">
                <div className="flex items-center justify-between border-b border-slate-100 p-4 dark:border-slate-800">
                    <div className="relative w-full sm:w-72">
                        <Search aria-hidden="true" className="absolute left-3 top-2.5 size-3.5 text-slate-400" />
                        <Input
                            placeholder="Search client by name or ID…"
                            aria-label="Search clients"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-8 pl-8 text-xs"
                        />
                    </div>
                    <Badge variant="outline" className="text-xs">
                        {filtered.length} {locale === 'km' ? 'អតិថិជន' : 'Clients'}
                    </Badge>
                </div>

                <Table>
                    <TableHeader className="bg-slate-50/80 dark:bg-slate-800/50">
                        <TableRow>
                            <TableHead className="text-xs font-bold">Client Name</TableHead>
                            <TableHead className="text-xs font-bold">Client ID</TableHead>
                            <TableHead className="text-xs font-bold">Grant Types</TableHead>
                            <TableHead className="text-xs font-bold">Scopes</TableHead>
                            <TableHead className="text-xs font-bold">PKCE</TableHead>
                            <TableHead className="text-right text-xs font-bold">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.map((client) => (
                            <TableRow key={client.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                                <TableCell>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedClient(client)}
                                        className="flex cursor-pointer items-center gap-2.5 font-bold text-xs text-slate-900 hover:text-violet-700 dark:text-white dark:hover:text-violet-300"
                                    >
                                        <span className="grid size-7 place-items-center rounded-lg bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                                            <Layers aria-hidden="true" className="size-4" />
                                        </span>
                                        <span>{client.clientName}</span>
                                    </button>
                                </TableCell>
                                <TableCell className="font-mono text-xs text-slate-600 dark:text-slate-300">
                                    {client.clientId}
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-1 max-w-xs">
                                        {toList(client.authorizationGrantTypes || client.grantTypes).map((gt) => (
                                            <Badge key={gt} variant="outline" className="text-[9px]">
                                                {gt}
                                            </Badge>
                                        ))}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-1 max-w-xs">
                                        {toList(client.scopes).slice(0, 3).map((sc) => (
                                            <Badge key={sc} variant="secondary" className="text-[9px] font-mono">
                                                {sc}
                                            </Badge>
                                        ))}
                                        {toList(client.scopes).length > 3 && (
                                            <span className="text-[10px] text-slate-400">
                                                +{toList(client.scopes).length - 3}
                                            </span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={client.requireProofKey ? 'success' : 'outline'} className="text-[9px]">
                                        {client.requireProofKey ? 'Enforced' : 'Optional'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <Button
                                            variant="ghost"
                                            size="xs"
                                            onClick={() => setSelectedClient(client)}
                                            aria-label={`View details of ${client.clientName}`}
                                            className="text-slate-600 hover:text-violet-700"
                                        >
                                            <KeyRound aria-hidden="true" className="size-3.5" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="xs"
                                            onClick={() => handleDelete(client)}
                                            aria-label={`Delete ${client.clientName}`}
                                            className="text-red-500 hover:bg-red-50 hover:text-red-700"
                                        >
                                            <Trash2 aria-hidden="true" className="size-3.5" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}

                        {filtered.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center text-xs text-slate-400">
                                    No OAuth2 clients match your search.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Card>

            <CreateClientDialog
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                onCreated={() => {
                    notify('OAuth2 client registered successfully')
                    loadClients()
                }}
                t={t}
            />

            <ClientDetailDialog
                client={selectedClient}
                onClose={() => setSelectedClient(null)}
                onRegenerate={handleRegenerateSecret}
                t={t}
            />
        </div>
    )
}