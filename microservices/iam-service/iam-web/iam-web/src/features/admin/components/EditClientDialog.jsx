import {useEffect, useId, useRef, useState} from 'react'
import {CircleAlert, Layers, LoaderCircle, Lock, Pencil, RefreshCw, X} from 'lucide-react'
import {adminApi} from '../api/adminApi'
import {editClientSchema, validateForm} from '../../../utils/validation'

const ALL_SCOPES = ['openid', 'profile', 'email', 'phone', 'address']
const ALL_GRANT_TYPES = [
    {id: 'authorization_code', label: 'Authorization Code'},
    {id: 'refresh_token', label: 'Refresh Token'},
    {id: 'client_credentials', label: 'Client Credentials'},
]
const AUTH_METHODS = [
    {id: 'client_secret_basic', label: 'Client secret (Basic)'},
    {id: 'client_secret_post', label: 'Client secret (POST body)'},
    {id: 'none', label: 'None (public client, use PKCE)'},
]

const splitLines = (value) =>
    value
        ? value
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean)
        : []

const inputBase =
    'h-9 w-full min-w-0 rounded-lg border bg-white px-3 text-xs font-normal outline-none placeholder:text-slate-400 focus-visible:ring-2 disabled:opacity-60 dark:bg-slate-950 dark:placeholder:text-slate-500'
const textareaBase =
    'w-full min-w-0 resize-y rounded-lg border bg-white px-3 py-2 font-mono text-[11px] font-normal leading-relaxed outline-none placeholder:text-slate-400 focus-visible:ring-2 disabled:opacity-60 dark:bg-slate-950 dark:placeholder:text-slate-500'
const inputOk = 'border-slate-200 focus-visible:ring-violet-500 dark:border-slate-700'
const inputBad = 'border-red-500 focus-visible:ring-red-500'
const labelBase = 'grid min-w-0 gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300'
const hintClass = 'text-[11px] font-normal text-slate-500 dark:text-slate-400'
const checkboxClass = 'size-4 shrink-0 cursor-pointer accent-violet-700'

export default function EditClientDialog({open, client, onClose, onUpdated, locale = 'en', t = {}}) {
    const dialogRef = useRef(null)
    const idPrefix = useId()

    const [form, setForm] = useState({
        clientName: '',
        clientId: '',
        clientSecret: '',
        authMethod: 'client_secret_basic',
        grantTypes: ['authorization_code', 'refresh_token'],
        redirectUris: '',
        postLogoutUris: '',
        scopes: ['openid', 'profile', 'email'],
        requirePkce: true,
        requireConsent: true,
    })
    const [busy, setBusy] = useState(false)
    const [formError, setFormError] = useState('')
    const [fieldErrors, setFieldErrors] = useState({})

    useEffect(() => {
        const dialog = dialogRef.current
        if (!dialog) return
        if (open && !dialog.open) dialog.showModal()
        if (!open && dialog.open) dialog.close()
    }, [open])

    useEffect(() => {
        if (open && client) {
            const rawGrants = client.authorizationGrantTypes || (typeof client.grantTypes === 'string' ? client.grantTypes.split(',') : client.grantTypes) || []
            const grants = (Array.isArray(rawGrants) ? rawGrants : [rawGrants]).map((g) => String(g).trim()).filter(Boolean)
            
            const rawMethods = client.clientAuthenticationMethods
            const authMethod = Array.isArray(rawMethods) && rawMethods.length > 0
                ? rawMethods[0]
                : (typeof rawMethods === 'string' && rawMethods.trim() ? rawMethods.trim() : 'client_secret_basic')

            const rawRedirects = client.redirectUris
            const redirectList = Array.isArray(rawRedirects)
                ? rawRedirects
                : (typeof rawRedirects === 'string' && rawRedirects.trim() ? rawRedirects.split(',') : [])

            const rawPostLogout = client.postLogoutRedirectUris
            const postLogoutList = Array.isArray(rawPostLogout)
                ? rawPostLogout
                : (typeof rawPostLogout === 'string' && rawPostLogout.trim() ? rawPostLogout.split(',') : [])

            const rawScopes = client.scopes
            const scopeList = (Array.isArray(rawScopes) ? rawScopes : (typeof rawScopes === 'string' ? rawScopes.split(',') : []))
                .map((s) => String(s).trim())
                .filter(Boolean)

            setForm({
                clientName: client.clientName || client.clientId || '',
                clientId: client.clientId || client.id || '',
                clientSecret: '',
                authMethod,
                grantTypes: grants.length > 0 ? grants : ['authorization_code'],
                redirectUris: redirectList.map((u) => String(u).trim()).filter(Boolean).join('\n'),
                postLogoutUris: postLogoutList.map((u) => String(u).trim()).filter(Boolean).join('\n'),
                scopes: scopeList.length > 0 ? scopeList : ['openid', 'profile', 'email'],
                requirePkce: client.requireProofKey ?? true,
                requireConsent: client.requireConsent ?? true,
            })
            setFormError('')
            setFieldErrors({})
        }
    }, [open, client])

    function update(field, value) {
        setForm((current) => ({...current, [field]: value}))
        setFieldErrors((current) => {
            if (!current[field]) return current
            const {[field]: _removed, ...rest} = current
            return rest
        })
    }

    function toggle(field, value) {
        setForm((current) => {
            const list = current[field]
            return {
                ...current,
                [field]: list.includes(value) ? list.filter((item) => item !== value) : [...list, value],
            }
        })
    }

    function generateSecret() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'
        const bytes = new Uint8Array(32)
        crypto.getRandomValues(bytes)
        let secret = 'sec_'
        for (const byte of bytes) secret += chars[byte % chars.length]
        update('clientSecret', secret)
    }

    function close() {
        if (busy) return
        setFormError('')
        setFieldErrors({})
        onClose()
    }

    async function submit(event) {
        event.preventDefault()
        if (busy || !client) return
        setFormError('')
        setFieldErrors({})

        const clientName = form.clientName.trim()
        const validation = validateForm(editClientSchema, {clientName})
        if (!validation.success) {
            setFieldErrors(validation.errors)
            return
        }

        const isAuthCode = form.grantTypes.includes('authorization_code')
        const redirectUrisList = splitLines(form.redirectUris)
        if (isAuthCode && redirectUrisList.length === 0) {
            setFieldErrors({
                redirectUris: locale === 'km'
                    ? 'តម្រូវឱ្យមានយ៉ាងហោចណាស់ Redirect URI មួយនៅពេលប្រើ Authorization Code'
                    : 'At least one Redirect URI is required when Authorization Code grant is enabled'
            })
            return
        }

        setBusy(true)
        try {
            await adminApi.updateClient(client.id || client.clientId, {
                clientName,
                clientSecret: form.clientSecret.trim() || undefined,
                clientAuthenticationMethods: [form.authMethod],
                authorizationGrantTypes: form.grantTypes,
                redirectUris: redirectUrisList,
                postLogoutRedirectUris: splitLines(form.postLogoutUris),
                scopes: form.scopes,
                clientSettings: {
                    'settings.client.require-proof-key': form.requirePkce,
                    'settings.client.require-authorization-consent': form.requireConsent,
                },
            })
            close()
            onUpdated()
        } catch (requestError) {
            setFormError(requestError.message || (locale === 'km' ? 'បរាជ័យក្នុងការកែប្រែព័ត៌មានអតិថិជន' : 'Failed to update OAuth2 client.'))
        } finally {
            setBusy(false)
        }
    }

    const titleId = `${idPrefix}-title`
    const isKm = locale === 'km'
    const nameError = fieldErrors.clientName
    const uriError = fieldErrors.redirectUris

    return (
        <dialog
            ref={dialogRef}
            aria-labelledby={titleId}
            onCancel={(event) => {
                event.preventDefault()
                close()
            }}
            onClick={(event) => {
                if (event.target === dialogRef.current) close()
            }}
            className="m-auto max-h-[calc(100dvh-2rem)] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-xs open:animate-in open:fade-in open:zoom-in-95 open:duration-150 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
        >
            <form onSubmit={submit} noValidate className="grid gap-4 p-6">
                <header className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                        <Pencil aria-hidden="true" className="size-5 text-violet-700 dark:text-violet-400" />
                        <div>
                            <h2 id={titleId} className="text-base font-semibold">
                                {isKm ? 'កែប្រែកម្មវិធីអតិថិជន OAuth2' : 'Edit OAuth2 Client'}
                            </h2>
                            <p className="text-[11px] text-slate-500 font-mono">
                                {form.clientId}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={close}
                        disabled={busy}
                        aria-label={t.close || 'Close'}
                        className="cursor-pointer rounded-md p-1 text-slate-400 hover:text-slate-600 focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:outline-none disabled:opacity-60 dark:hover:text-slate-200"
                    >
                        <X aria-hidden="true" className="size-4" />
                    </button>
                </header>

                {formError && (
                    <div
                        role="alert"
                        className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-300"
                    >
                        <CircleAlert aria-hidden="true" className="size-4 shrink-0" />
                        <span>{formError}</span>
                    </div>
                )}

                <label className={labelBase}>
                    <span>{isKm ? 'ឈ្មោះកម្មវិធីអតិថិជន *' : 'Application Name *'}</span>
                    <input
                        type="text"
                        value={form.clientName}
                        onChange={(event) => update('clientName', event.target.value)}
                        placeholder="e.g. Frontend Web App"
                        autoComplete="off"
                        autoFocus
                        aria-required="true"
                        aria-invalid={nameError ? 'true' : undefined}
                        aria-describedby={nameError ? `${idPrefix}-name-error` : undefined}
                        disabled={busy}
                        className={`${inputBase} ${nameError ? inputBad : inputOk}`}
                    />
                    {nameError && (
                        <span id={`${idPrefix}-name-error`} className="text-[11px] font-normal text-red-500">
                            {nameError}
                        </span>
                    )}
                </label>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-[repeat(2,minmax(0,1fr))]">
                    <label className={labelBase}>
                        <span className="flex items-center gap-1.5">
                            <Lock aria-hidden="true" className="size-3 text-slate-400" />
                            {isKm ? 'អត្តសញ្ញាណប័ណ្ណ (Client ID)' : 'Client ID (Identifier)'}
                        </span>
                        <input
                            type="text"
                            value={form.clientId}
                            disabled
                            readOnly
                            className={`${inputBase} font-mono text-[11px] bg-slate-50 text-slate-500 dark:bg-slate-900 dark:text-slate-400 cursor-not-allowed border-slate-200 dark:border-slate-800`}
                        />
                        <span className={hintClass}>
                            {isKm ? 'អត្តសញ្ញាណប័ណ្ណកម្មវិធីមិនអាចកែប្រែបានទេ' : 'Client identifier cannot be modified'}
                        </span>
                    </label>

                    <div className={labelBase}>
                        <label htmlFor={`${idPrefix}-secret`}>
                            {isKm ? 'ពាក្យសម្ងាត់ថ្មី (ស្រេចចិត្ត)' : 'New Client Secret (Optional)'}
                        </label>
                        <div className="flex min-w-0 gap-2">
                            <input
                                id={`${idPrefix}-secret`}
                                type="text"
                                value={form.clientSecret}
                                onChange={(event) => update('clientSecret', event.target.value)}
                                placeholder={isKm ? 'ទុកនៅទទេដើម្បីរក្សាពាក្យសម្ងាត់ដដែល' : 'Leave empty to keep existing secret'}
                                autoComplete="off"
                                autoCapitalize="none"
                                spellCheck={false}
                                disabled={busy}
                                className={`${inputBase} font-mono text-[11px] ${inputOk}`}
                            />
                            <button
                                type="button"
                                onClick={generateSecret}
                                disabled={busy}
                                className="inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-medium hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:outline-none disabled:opacity-60 dark:border-slate-700 dark:hover:bg-slate-800"
                            >
                                <RefreshCw aria-hidden="true" className="size-3.5" />
                                {isKm ? 'បង្កើត' : 'Generate'}
                            </button>
                        </div>
                        <span className={hintClass}>
                            {isKm ? 'បញ្ចូលពាក្យសម្ងាត់ថ្មីប្រសិនបើអ្នកចង់ផ្លាស់ប្តូរ' : 'Enter a new secret only if you want to rotate it'}
                        </span>
                    </div>
                </div>

                <label className={labelBase}>
                    <span>{isKm ? 'វិធីសាស្ត្រផ្ទៀងផ្ទាត់ (Authentication method)' : 'Authentication method'}</span>
                    <select
                        value={form.authMethod}
                        onChange={(event) => update('authMethod', event.target.value)}
                        disabled={busy}
                        className={`${inputBase} ${inputOk}`}
                    >
                        {AUTH_METHODS.map((method) => (
                            <option key={method.id} value={method.id}>{method.label}</option>
                        ))}
                    </select>
                </label>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-[repeat(2,minmax(0,1fr))]">
                    <label className={labelBase}>
                        <span>{isKm ? 'Redirect URIs (បញ្ជូនបន្ត)' : 'Redirect URIs'}</span>
                        <textarea
                            value={form.redirectUris}
                            onChange={(event) => update('redirectUris', event.target.value)}
                            rows={3}
                            placeholder="https://app.example.com/callback"
                            spellCheck={false}
                            disabled={busy}
                            className={`${textareaBase} ${uriError ? inputBad : inputOk}`}
                        />
                        <span className={hintClass}>
                            {isKm ? 'មួយក្នុងមួយជួរ' : 'One URI per line'}
                        </span>
                        {uriError && (
                            <span className="text-[11px] font-normal text-red-500">
                                {uriError}
                            </span>
                        )}
                    </label>

                    <label className={labelBase}>
                        <span>{isKm ? 'Post-logout redirect URIs' : 'Post-logout redirect URIs'}</span>
                        <textarea
                            value={form.postLogoutUris}
                            onChange={(event) => update('postLogoutUris', event.target.value)}
                            rows={3}
                            placeholder="https://app.example.com"
                            spellCheck={false}
                            disabled={busy}
                            className={`${textareaBase} ${inputOk}`}
                        />
                        <span className={hintClass}>
                            {isKm ? 'មួយក្នុងមួយជួរ' : 'One URI per line'}
                        </span>
                    </label>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-[repeat(2,minmax(0,1fr))]">
                    <fieldset disabled={busy} className="grid min-w-0 content-start gap-2">
                        <legend className="mb-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                            {isKm ? 'ប្រភេទ Grant Types' : 'Grant types'}
                        </legend>
                        {ALL_GRANT_TYPES.map((grant) => (
                            <label key={grant.id} className="flex cursor-pointer items-center gap-2 text-xs">
                                <input
                                    type="checkbox"
                                    checked={form.grantTypes.includes(grant.id)}
                                    onChange={() => toggle('grantTypes', grant.id)}
                                    className={checkboxClass}
                                />
                                <span>{grant.label}</span>
                            </label>
                        ))}
                    </fieldset>

                    <fieldset disabled={busy} className="grid min-w-0 content-start gap-2">
                        <legend className="mb-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                            {isKm ? 'សិទ្ធិ Scopes' : 'Scopes'}
                        </legend>
                        <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                            {ALL_SCOPES.map((scope) => (
                                <label key={scope} className="flex cursor-pointer items-center gap-2 text-xs">
                                    <input
                                        type="checkbox"
                                        checked={form.scopes.includes(scope)}
                                        onChange={() => toggle('scopes', scope)}
                                        className={checkboxClass}
                                    />
                                    <span className="font-mono text-[11px]">{scope}</span>
                                </label>
                            ))}
                        </div>
                    </fieldset>
                </div>

                <fieldset
                    disabled={busy}
                    className="flex flex-wrap gap-x-6 gap-y-2 border-t border-slate-100 pt-3 dark:border-slate-800"
                >
                    <legend className="sr-only">{isKm ? 'ជម្រើសសុវត្ថិភាព' : 'Security options'}</legend>
                    <label className="flex cursor-pointer items-center gap-2 text-xs">
                        <input
                            type="checkbox"
                            checked={form.requirePkce}
                            onChange={(event) => update('requirePkce', event.target.checked)}
                            className={checkboxClass}
                        />
                        <span>{isKm ? 'តម្រូវឱ្យប្រើ PKCE (S256)' : 'Require PKCE (S256)'}</span>
                    </label>
                    <label className="flex cursor-pointer items-center gap-2 text-xs">
                        <input
                            type="checkbox"
                            checked={form.requireConsent}
                            onChange={(event) => update('requireConsent', event.target.checked)}
                            className={checkboxClass}
                        />
                        <span>{isKm ? 'តម្រូវឱ្យមានការយល់ព្រមពីអ្នកប្រើ (Consent)' : 'Require User Consent'}</span>
                    </label>
                </fieldset>

                <footer className="mt-2 flex items-center justify-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                    <button
                        type="button"
                        onClick={close}
                        disabled={busy}
                        className="h-9 cursor-pointer rounded-lg border border-slate-200 px-4 text-xs font-medium hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:outline-none disabled:opacity-60 dark:border-slate-700 dark:hover:bg-slate-800"
                    >
                        {isKm ? 'បោះបង់' : 'Cancel'}
                    </button>
                    <button
                        type="submit"
                        disabled={busy}
                        className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg bg-violet-700 px-4 text-xs font-semibold text-white hover:bg-violet-800 focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:outline-none disabled:opacity-60"
                    >
                        {busy
                            ? <LoaderCircle aria-hidden="true" className="size-3.5 animate-spin" />
                            : <Layers aria-hidden="true" className="size-3.5" />}
                        <span>{busy ? (isKm ? 'កំពុងរក្សាទុក…' : 'Saving…') : (isKm ? 'រក្សាទុកការផ្លាស់ប្តូរ' : 'Save Changes')}</span>
                    </button>
                </footer>
            </form>
        </dialog>
    )
}
