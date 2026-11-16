import {useState} from 'react'
import {CircleAlert, Layers, LoaderCircle, X} from 'lucide-react'
import {adminApi} from '../api/adminApi'
import {clientSchema, validateForm} from '../../../utils/validation'

const ALL_SCOPES = ['openid', 'profile', 'email', 'phone', 'address']
const ALL_GRANT_TYPES = [
    {id: 'authorization_code', label: 'Authorization Code'},
    {id: 'refresh_token', label: 'Refresh Token'},
    {id: 'client_credentials', label: 'Client Credentials'},
]

export default function CreateClientDialog({open, onClose, onCreated, locale, t}) {
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
    const [formError, setFormError] = useState('')
    const [fieldErrors, setFieldErrors] = useState({})

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

    function close() {
        setClientName('')
        setClientId('')
        setClientSecret('')
        setFormError('')
        setFieldErrors({})
        onClose()
    }

    async function submit(e) {
        e.preventDefault()
        setFormError('')
        setFieldErrors({})

        const validation = validateForm(clientSchema, {
            clientId: clientId.trim() || 'auto-generated',
            clientName: clientName.trim(),
            redirectUris: redirectUris.trim(),
        })
        if (!validation.success) {
            setFieldErrors(validation.errors)
            setFormError(validation.firstErrorMessage)
            return
        }
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
                clientSettings: {
                    'settings.client.require-proof-key': requirePkce,
                    'settings.client.require-authorization-consent': requireConsent,
                },
            })
            close()
            onCreated()
        } catch (err) {
            setFormError(err.message || 'Failed to register client')
        } finally {
            setBusy(false)
        }
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
            <div
                className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 my-auto animate-in zoom-in-95 duration-150">
                <header
                    className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                        <Layers className="size-5 text-violet-600"/>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                            {locale === 'km' ? 'ចុះឈ្មោះអតិថិជន OAuth2 ថ្មី' : 'Register New OAuth2 Client'}
                        </h3>
                    </div>
                    <button onClick={close} className="text-slate-400 hover:text-slate-600">
                        <X className="size-4"/>
                    </button>
                </header>

                {formError && (
                    <div
                        className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 p-2 text-xs text-red-700 dark:bg-red-950 dark:text-red-300">
                        <CircleAlert className="size-4 shrink-0"/>
                        <span>{formError}</span>
                    </div>
                )}

                <form onSubmit={submit} className="mt-4 grid gap-3.5 text-xs max-h-[75vh] overflow-y-auto pr-1">
                    <label className="grid gap-1 font-semibold text-slate-700 dark:text-slate-300">
                        <span>Client Application Name *</span>
                        <input
                            type="text"
                            value={clientName}
                            onChange={(e) => setClientName(e.target.value)}
                            placeholder="e.g. Mobile iOS Client"
                            required
                            className="h-9 rounded-lg border border-slate-200 px-3 dark:border-slate-700 dark:bg-slate-950"
                        />
                    </label>

                    <div className="grid grid-cols-2 gap-3">
                        <label className="grid gap-1 font-semibold text-slate-700 dark:text-slate-300">
                            <span>Client ID (Leave blank to auto-generate)</span>
                            <input
                                type="text"
                                value={clientId}
                                onChange={(e) => setClientId(e.target.value)}
                                placeholder="Auto-generated if empty"
                                className="h-9 rounded-lg border border-slate-200 px-3 font-mono text-[11px] dark:border-slate-700 dark:bg-slate-950"
                            />
                        </label>
                        <label className="grid gap-1 font-semibold text-slate-700 dark:text-slate-300">
                            <div className="flex items-center justify-between">
                                <span>Client Secret</span>
                                <button
                                    type="button"
                                    onClick={generateSecret}
                                    className="text-[11px] text-violet-600 hover:underline cursor-pointer"
                                >
                                    Generate
                                </button>
                            </div>
                            <input
                                type="text"
                                value={clientSecret}
                                onChange={(e) => setClientSecret(e.target.value)}
                                placeholder="Generated secret"
                                className="h-9 rounded-lg border border-slate-200 px-3 font-mono text-[11px] dark:border-slate-700 dark:bg-slate-950"
                            />
                        </label>
                    </div>

                    <label className="grid gap-1 font-semibold text-slate-700 dark:text-slate-300">
                        <span>Redirect URIs (One per line) *</span>
                        <textarea
                            value={redirectUris}
                            onChange={(e) => setRedirectUris(e.target.value)}
                            rows={2}
                            required
                            placeholder="http://localhost:3000/callback"
                            className="rounded-lg border border-slate-200 p-2 font-mono text-xs dark:border-slate-700 dark:bg-slate-950"
                        />
                    </label>

                    <label className="grid gap-1 font-semibold text-slate-700 dark:text-slate-300">
                        <span>Post-Logout Redirect URIs (One per line)</span>
                        <textarea
                            value={postLogoutUris}
                            onChange={(e) => setPostLogoutUris(e.target.value)}
                            rows={1}
                            placeholder="http://localhost:3000"
                            className="rounded-lg border border-slate-200 p-2 font-mono text-xs dark:border-slate-700 dark:bg-slate-950"
                        />
                    </label>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <span
                                className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Grant Types:</span>
                            <div className="grid gap-1">
                                {ALL_GRANT_TYPES.map((gt) => (
                                    <label key={gt.id} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={grantTypes.includes(gt.id)}
                                            onChange={() => toggleGrantType(gt.id)}
                                            className="rounded text-violet-600"
                                        />
                                        <span className="text-[11px]">{gt.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Scopes:</span>
                            <div className="grid grid-cols-2 gap-1">
                                {ALL_SCOPES.map((sc) => (
                                    <label key={sc} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={scopes.includes(sc)}
                                            onChange={() => toggleScope(sc)}
                                            className="rounded text-violet-600"
                                        />
                                        <span className="text-[11px] font-mono">{sc}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 border-t border-slate-100 pt-2 dark:border-slate-800">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={requirePkce}
                                onChange={(e) => setRequirePkce(e.target.checked)}
                                className="rounded text-violet-600"
                            />
                            <span className="text-[11px] font-medium">Require PKCE (S256)</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={requireConsent}
                                onChange={(e) => setRequireConsent(e.target.checked)}
                                className="rounded text-violet-600"
                            />
                            <span className="text-[11px] font-medium">Require User Consent</span>
                        </label>
                    </div>

                    <footer
                        className="mt-3 flex justify-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={close}
                            className="h-9 rounded-lg border border-slate-200 px-3 text-xs font-medium hover:bg-slate-50 dark:border-slate-700 cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            disabled={busy}
                            type="submit"
                            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-violet-700 px-4 text-xs font-semibold text-white hover:bg-violet-800 disabled:opacity-60 cursor-pointer"
                        >
                            {busy ? <LoaderCircle className="size-3.5 animate-spin"/> : <Layers className="size-3.5"/>}
                            {busy ? 'Registering…' : 'Register Client'}
                        </button>
                    </footer>
                </form>
            </div>
        </div>
    )
}
