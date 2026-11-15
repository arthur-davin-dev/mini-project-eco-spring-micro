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

function RegisterClientModal({open, onClose, onCreated, locale}) {
    const [clientName, setClientName] = useState('')
    const [clientId, setClientId] = useState('')
    const [clientSecret, setClientSecret] = useState('')
    const [authMethod, setAuthMethod] = useState('client_secret_basic')
    const [grantTypes, setGrantTypes] = useState(['authorization_code', 'refresh_token'])
    const [redirectUris, setRedirectUris] = useState('http://localhost:3000/callback')
    const [postLogoutUris, setPostLogoutUris] = useState('http://localhost:3000')
    const [scopes, setScopes] = useState(['openid', 'profile', 'email'])
    const [requirePkce, setRequirePkce] = useState(true)
    const [requireConsent, setRequireConsent] = useState(true)
    const [busy, setBusy] = useState(false)

    if (!open) return null

    function toggleGrantType(gt) {
        setGrantTypes((curr) => (curr.includes(gt) ? curr.filter((g) => g !== gt) : [...curr, gt]))
    }

    function toggleScope(sc) {
        setScopes((curr) => (curr.includes(sc) ? curr.filter((s) => s !== sc) : [...curr, sc]))
    }

    function generateSecret() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'
        let s = 'sec_'
        for (let i = 0; i < 32; i++) s += chars.charAt(Math.floor(Math.random() * chars.length))
        setClientSecret(s)
    }

    async function submit(e) {
        e.preventDefault()
        if (!clientName.trim()) return
        setBusy(true)

        try {
            const uris = redirectUris
                .split('\n')
                .map((u) => u.trim())
                .filter(Boolean)
            const postUris = postLogoutUris
                .split('\n')
                .map((u) => u.trim())
                .filter(Boolean)

            await adminApi.createClient({
                clientName: clientName.trim(),
                clientId: clientId.trim() || undefined,
                clientSecret: clientSecret.trim() || undefined,
                clientAuthenticationMethods: [authMethod],
                authorizationGrantTypes: grantTypes,
                redirectUris: uris,
                postLogoutRedirectUris: postUris,
                scopes,
                requireProofKey: requirePkce,
                requireConsent,
            })
            onCreated()
            onClose()
        } catch (err) {
            console.error('Failed to register client:', err)
        } finally {
            setBusy(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95">
                <header className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Layers className="size-5 text-violet-600" />
                        {locale === 'km' ? 'ចុះឈ្មោះអតិថិជន OAuth2 / OIDC ថ្មី' : 'Register OAuth2 / OIDC Client'}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
                </header>

                <form onSubmit={submit} className="mt-4 grid gap-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <label className="grid gap-1 font-semibold text-slate-700 dark:text-slate-300">
                            <span>Client Name *</span>
                            <Input
                                required
                                placeholder="e.g. Mobile Android App"
                                value={clientName}
                                onChange={(e) => setClientName(e.target.value)}
                                className="text-xs"
                            />
                        </label>

                        <label className="grid gap-1 font-semibold text-slate-700 dark:text-slate-300">
                            <span>Client ID (optional, auto-generated if blank)</span>
                            <Input
                                placeholder="e.g. mobile-android-client"
                                value={clientId}
                                onChange={(e) => setClientId(e.target.value)}
                                className="text-xs font-mono"
                            />
                        </label>
                    </div>

                    <label className="grid gap-1 font-semibold text-slate-700 dark:text-slate-300">
                        <div className="flex items-center justify-between">
                            <span>Client Secret (leave empty for public clients / PKCE)</span>
                            <button
                                type="button"
                                onClick={generateSecret}
                                className="text-[11px] text-violet-600 hover:underline font-semibold"
                            >
                                Generate Secret
                            </button>
                        </div>
                        <Input
                            placeholder="secret-token-..."
                            value={clientSecret}
                            onChange={(e) => setClientSecret(e.target.value)}
                            className="text-xs font-mono"
                        />
                    </label>

                    <label className="grid gap-1 font-semibold text-slate-700 dark:text-slate-300">
                        <span>Authentication Method</span>
                        <select
                            value={authMethod}
                            onChange={(e) => setAuthMethod(e.target.value)}
                            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs dark:border-slate-700 dark:bg-slate-950"
                        >
                            <option value="client_secret_basic">client_secret_basic (HTTP Basic)</option>
                            <option value="client_secret_post">client_secret_post (POST Body)</option>
                            <option value="none">none (Public Client with PKCE only)</option>
                        </select>
                    </label>

                    {/* Grant Types */}
                    <div>
                        <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                            Authorization Grant Types
                        </span>
                        <div className="flex flex-wrap gap-2">
                            {AVAILABLE_GRANT_TYPES.map((gt) => (
                                <label
                                    key={gt.id}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs cursor-pointer ${
                                        grantTypes.includes(gt.id)
                                            ? 'border-violet-600 bg-violet-50 text-violet-900 font-bold dark:bg-violet-950 dark:text-violet-200'
                                            : 'border-slate-200 hover:bg-slate-50 dark:border-slate-800'
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={grantTypes.includes(gt.id)}
                                        onChange={() => toggleGrantType(gt.id)}
                                        className="accent-violet-700"
                                    />
                                    <span>{gt.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Redirect URIs */}
                    <label className="grid gap-1 font-semibold text-slate-700 dark:text-slate-300">
                        <span>Redirect URIs (one per line)</span>
                        <textarea
                            rows={2}
                            placeholder="https://app.example.com/callback"
                            value={redirectUris}
                            onChange={(e) => setRedirectUris(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 p-2 font-mono text-xs dark:border-slate-700 dark:bg-slate-950"
                        />
                    </label>

                    {/* Scopes */}
                    <div>
                        <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                            Permitted Scopes
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                            {AVAILABLE_SCOPES.map((sc) => (
                                <button
                                    type="button"
                                    key={sc}
                                    onClick={() => toggleScope(sc)}
                                    className={`px-2.5 py-1 rounded-md text-xs font-mono transition ${
                                        scopes.includes(sc)
                                            ? 'bg-violet-700 text-white font-bold'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                                    }`}
                                >
                                    {sc}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Security Toggles */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <label className="flex items-center gap-2 rounded-lg border border-slate-200 p-2.5 cursor-pointer dark:border-slate-800">
                            <input
                                type="checkbox"
                                checked={requirePkce}
                                onChange={(e) => setRequirePkce(e.target.checked)}
                                className="accent-violet-700"
                            />
                            <span>Require Proof Key (PKCE)</span>
                        </label>

                        <label className="flex items-center gap-2 rounded-lg border border-slate-200 p-2.5 cursor-pointer dark:border-slate-800">
                            <input
                                type="checkbox"
                                checked={requireConsent}
                                onChange={(e) => setRequireConsent(e.target.checked)}
                                className="accent-violet-700"
                            />
                            <span>Require User Consent</span>
                        </label>
                    </div>

                    <div className="flex justify-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                        <Button type="button" variant="outline" size="sm" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="default" size="sm" disabled={busy} className="bg-violet-700 text-white">
                            {busy ? 'Registering…' : 'Register Client'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95">
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

export default function AdminClientsPage({locale, t}) {
    const [clients, setClients] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [createOpen, setCreateOpen] = useState(false)
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

            <RegisterClientModal
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
