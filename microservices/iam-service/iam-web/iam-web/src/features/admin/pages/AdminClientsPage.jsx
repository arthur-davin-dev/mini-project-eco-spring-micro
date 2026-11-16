import {useEffect, useState} from 'react'
import {
    Layers,
    Plus,
    Search,
    RefreshCw,
    Check,
    Copy,
    Eye,
    EyeOff,
    Trash2,
    Edit,
    KeyRound,
    Globe,
    Shield,
    ExternalLink,
    AlertCircle,
    Sliders
} from 'lucide-react'
import {adminApi} from '../api/adminApi'
import CreateClientDialog from '../components/CreateClientDialog'
import {clientSchema, validateForm} from '../../../utils/validation'
import {Badge} from '../../../components/ui/badge'
import {Button} from '../../../components/ui/button'
import {Card} from '../../../components/ui/card'
import {Input} from '../../../components/ui/input'
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '../../../components/ui/table'

const AVAILABLE_SCOPES = ['openid', 'profile', 'email', 'phone', 'address', 'read', 'write']
const AVAILABLE_GRANT_TYPES = [
    {id: 'authorization_code', label: 'Authorization Code'},
    {id: 'refresh_token', label: 'Refresh Token'},
    {id: 'client_credentials', label: 'Client Credentials'},
]

function toList(val) {
    if (Array.isArray(val)) return val
    if (typeof val === 'string' && val.trim()) return val.split(',').map((s) => s.trim()).filter(Boolean)
    return []
}

function ClientDetailModal({open, onClose, client, onRegenerate, locale}) {
    const [showSecret, setShowSecret] = useState(false)
    const [copied, setCopied] = useState(false)

    if (!open || !client) return null

    function copyToClipboard(text) {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 my-auto animate-in zoom-in-95 duration-150">
                <header className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                        <Layers className="size-5 text-violet-600" />
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">{client.clientName}</h3>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
                </header>

                <div className="mt-4 grid gap-4 text-xs">
                    {/* Credentials Box */}
                    <div className="rounded-xl border border-violet-100 bg-violet-50/50 p-4 dark:border-violet-900 dark:bg-violet-950/30 space-y-3">
                        <div>
                            <span className="text-[11px] font-bold text-slate-500 uppercase">Client ID</span>
                            <div className="mt-1 flex items-center justify-between rounded-lg bg-white p-2 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 font-mono text-xs">
                                <span>{client.clientId}</span>
                                <button
                                    onClick={() => copyToClipboard(client.clientId)}
                                    className="text-violet-600 hover:text-violet-800"
                                >
                                    <Copy className="size-3.5" />
                                </button>
                            </div>
                        </div>

                        {client.clientSecret && (
                            <div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold text-slate-500 uppercase">Client Secret</span>
                                    <button
                                        type="button"
                                        onClick={() => setShowSecret(!showSecret)}
                                        className="text-[11px] text-slate-400 hover:text-slate-600"
                                    >
                                        {showSecret ? 'Hide' : 'Reveal'}
                                    </button>
                                </div>
                                <div className="mt-1 flex items-center justify-between rounded-lg bg-white p-2 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 font-mono text-xs">
                                    <span>{showSecret ? client.clientSecret : '••••••••••••••••••••••••'}</span>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => copyToClipboard(client.clientSecret)}
                                            className="text-violet-600 hover:text-violet-800"
                                        >
                                            <Copy className="size-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end">
                            <Button
                                size="xs"
                                variant="outline"
                                onClick={() => onRegenerate(client.id)}
                                className="text-[11px] border-violet-300 text-violet-700"
                            >
                                <KeyRound className="size-3 mr-1" />
                                Regenerate Secret
                            </Button>
                        </div>
                    </div>

                    {copied && (
                        <div className="rounded-lg bg-emerald-50 p-2 text-center text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                            Copied to clipboard!
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <span className="text-slate-400 font-medium">Authentication</span>
                            <p className="font-mono mt-0.5">{client.clientAuthenticationMethods?.join(', ')}</p>
                        </div>
                        <div>
                            <span className="text-slate-400 font-medium">PKCE Policy</span>
                            <p className="mt-0.5 font-semibold text-emerald-600">
                                {client.requireProofKey ? 'Required (S256)' : 'Optional'}
                            </p>
                        </div>
                    </div>

                    <div>
                        <span className="text-slate-400 font-medium">Grant Types</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                            {toList(client.authorizationGrantTypes || client.grantTypes).map((gt) => (
                                <Badge key={gt} variant="outline" className="text-[10px] font-mono">
                                    {gt}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    <div>
                        <span className="text-slate-400 font-medium">Redirect URIs</span>
                        <ul className="mt-1 space-y-1 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                            {toList(client.redirectUris).map((uri) => (
                                <li key={uri} className="truncate">• {uri}</li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <span className="text-slate-400 font-medium">Scopes</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                            {toList(client.scopes).map((sc) => (
                                <Badge key={sc} variant="secondary" className="text-[10px] font-mono">
                                    {sc}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
                        <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function AdminClientsPage({locale, t, initialCreateOpen}) {
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
        const newSecret = await adminApi.regenerateClientSecret(id)
        notify('Client secret regenerated')
        loadClients()
        setSelectedClient((curr) => (curr ? {...curr, clientSecret: newSecret} : null))
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
                <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
                    <Check className="size-4" />
                    <span>{notice}</span>
                </div>
            )}

            <Card className="gap-0 overflow-hidden shadow-none">
                <div className="flex items-center justify-between border-b border-slate-100 p-4 dark:border-slate-800">
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-2.5 size-3.5 text-slate-400" />
                        <Input
                            placeholder="Search client by name or ID…"
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
                                        className="flex items-center gap-2.5 font-bold text-xs text-slate-900 hover:text-violet-700 dark:text-white dark:hover:text-violet-300"
                                    >
                                        <span className="grid size-7 place-items-center rounded-lg bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                                            <Layers className="size-4" />
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
                                            className="text-slate-600 hover:text-violet-700"
                                        >
                                            <KeyRound className="size-3.5" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="xs"
                                            onClick={() => handleDelete(client)}
                                            className="text-red-500 hover:bg-red-50 hover:text-red-700"
                                        >
                                            <Trash2 className="size-3.5" />
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
                locale={locale}
            />

            <ClientDetailModal
                open={!!selectedClient}
                onClose={() => setSelectedClient(null)}
                client={selectedClient}
                onRegenerate={handleRegenerateSecret}
                locale={locale}
            />
        </div>
    )
}
