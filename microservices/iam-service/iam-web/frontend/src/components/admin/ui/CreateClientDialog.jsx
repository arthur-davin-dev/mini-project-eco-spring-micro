// import {useState} from 'react'
// import {CircleAlert, Layers, LoaderCircle, X} from 'lucide-react'
// import {adminApi} from '../../../features/admin/api/adminApi'
// import {clientSchema, validateForm} from '../../../utils/validation'
//
// const ALL_SCOPES = ['openid', 'profile', 'email', 'phone', 'address']
// const ALL_GRANT_TYPES = [
//     {id: 'authorization_code', label: 'Authorization Code'},
//     {id: 'refresh_token', label: 'Refresh Token'},
//     {id: 'client_credentials', label: 'Client Credentials'},
// ]
//
// export default function CreateClientDialog({open, onClose, onCreated, locale, t}) {
//     const [clientName, setClientName] = useState('')
//     const [clientId, setClientId] = useState('')
//     const [clientSecret, setClientSecret] = useState('')
//     const [authMethod, setAuthMethod] = useState('client_secret_basic')
//     const [grantTypes, setGrantTypes] = useState(['authorization_code', 'refresh_token'])
//     const [redirectUris, setRedirectUris] = useState('http://localhost:3000/callback')
//     const [postLogoutUris, setPostLogoutUris] = useState('http://localhost:3000')
//     const [scopes, setScopes] = useState(['openid', 'profile', 'email'])
//     const [requirePkce, setRequirePkce] = useState(true)
//     const [requireConsent, setRequireConsent] = useState(true)
//     const [busy, setBusy] = useState(false)
//     const [formError, setFormError] = useState('')
//     const [fieldErrors, setFieldErrors] = useState({})
//
//     if (!open) return null
//
//     function toggleGrantType(gt) {
//         setGrantTypes((curr) => (curr.includes(gt) ? curr.filter((g) => g !== gt) : [...curr, gt]))
//     }
//
//     function toggleScope(sc) {
//         setScopes((curr) => (curr.includes(sc) ? curr.filter((s) => s !== sc) : [...curr, sc]))
//     }
//
//     function generateSecret() {
//         const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'
//         let s = 'sec_'
//         for (let i = 0; i < 32; i++) s += chars.charAt(Math.floor(Math.random() * chars.length))
//         setClientSecret(s)
//     }
//
//     function close() {
//         setClientName('')
//         setClientId('')
//         setClientSecret('')
//         setFormError('')
//         setFieldErrors({})
//         onClose()
//     }
//
//     async function submit(e) {
//         e.preventDefault()
//         setFormError('')
//         setFieldErrors({})
//
//         const validation = validateForm(clientSchema, {
//             clientId: clientId.trim() || 'auto-generated',
//             clientName: clientName.trim(),
//             redirectUris: redirectUris.trim(),
//         })
//         if (!validation.success) {
//             setFieldErrors(validation.errors)
//             setFormError(validation.firstErrorMessage)
//             return
//         }
//         setBusy(true)
//
//         try {
//             const uris = redirectUris
//                 .split('\n')
//                 .map((u) => u.trim())
//                 .filter(Boolean)
//             const postUris = postLogoutUris
//                 .split('\n')
//                 .map((u) => u.trim())
//                 .filter(Boolean)
//
//             await adminApi.createClient({
//                 clientName: clientName.trim(),
//                 clientId: clientId.trim() || undefined,
//                 clientSecret: clientSecret.trim() || undefined,
//                 clientAuthenticationMethods: [authMethod],
//                 authorizationGrantTypes: grantTypes,
//                 redirectUris: uris,
//                 postLogoutRedirectUris: postUris,
//                 scopes,
//                 clientSettings: {
//                     'settings.client.require-proof-key': requirePkce,
//                     'settings.client.require-authorization-consent': requireConsent,
//                 },
//             })
//             close()
//             onCreated()
//         } catch (err) {
//             setFormError(err.message || 'Failed to register client')
//         } finally {
//             setBusy(false)
//         }
//     }
//
//     return (
//         <div
//             className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
//             <div
//                 className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 my-auto animate-in zoom-in-95 duration-150">
//                 <header
//                     className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
//                     <div className="flex items-center gap-2">
//                         <Layers className="size-5 text-violet-600"/>
//                         <h3 className="text-base font-bold text-slate-900 dark:text-white">
//                             {locale === 'km' ? 'ចុះឈ្មោះអតិថិជន OAuth2 ថ្មី' : 'Register New OAuth2 Client'}
//                         </h3>
//                     </div>
//                     <button onClick={close} className="text-slate-400 hover:text-slate-600">
//                         <X className="size-4"/>
//                     </button>
//                 </header>
//
//                 {formError && (
//                     <div
//                         className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 p-2 text-xs text-red-700 dark:bg-red-950 dark:text-red-300">
//                         <CircleAlert className="size-4 shrink-0"/>
//                         <span>{formError}</span>
//                     </div>
//                 )}
//
//                 <form onSubmit={submit} className="mt-4 grid gap-3.5 text-xs max-h-[75vh] overflow-y-auto pr-1">
//                     <label className="grid gap-1 font-semibold text-slate-700 dark:text-slate-300">
//                         <span>Client Application Name *</span>
//                         <input
//                             type="text"
//                             value={clientName}
//                             onChange={(e) => setClientName(e.target.value)}
//                             placeholder="e.g. Mobile iOS Client"
//                             required
//                             className="h-9 rounded-lg border border-slate-200 px-3 dark:border-slate-700 dark:bg-slate-950"
//                         />
//                     </label>
//
//                     <div className="grid grid-cols-2 gap-3">
//                         <label className="grid gap-1 font-semibold text-slate-700 dark:text-slate-300">
//                             <span>Client ID (Leave blank to auto-generate)</span>
//                             <input
//                                 type="text"
//                                 value={clientId}
//                                 onChange={(e) => setClientId(e.target.value)}
//                                 placeholder="Auto-generated if empty"
//                                 className="h-9 rounded-lg border border-slate-200 px-3 font-mono text-[11px] dark:border-slate-700 dark:bg-slate-950"
//                             />
//                         </label>
//                         <label className="grid gap-1 font-semibold text-slate-700 dark:text-slate-300">
//                             <div className="flex items-center justify-between">
//                                 <span>Client Secret</span>
//                                 <button
//                                     type="button"
//                                     onClick={generateSecret}
//                                     className="text-[11px] text-violet-600 hover:underline cursor-pointer"
//                                 >
//                                     Generate
//                                 </button>
//                             </div>
//                             <input
//                                 type="text"
//                                 value={clientSecret}
//                                 onChange={(e) => setClientSecret(e.target.value)}
//                                 placeholder="Generated secret"
//                                 className="h-9 rounded-lg border border-slate-200 px-3 font-mono text-[11px] dark:border-slate-700 dark:bg-slate-950"
//                             />
//                         </label>
//                     </div>
//
//                     <label className="grid gap-1 font-semibold text-slate-700 dark:text-slate-300">
//                         <span>Redirect URIs (One per line) *</span>
//                         <textarea
//                             value={redirectUris}
//                             onChange={(e) => setRedirectUris(e.target.value)}
//                             rows={2}
//                             required
//                             placeholder="http://localhost:3000/callback"
//                             className="rounded-lg border border-slate-200 p-2 font-mono text-xs dark:border-slate-700 dark:bg-slate-950"
//                         />
//                     </label>
//
//                     <label className="grid gap-1 font-semibold text-slate-700 dark:text-slate-300">
//                         <span>Post-Logout Redirect URIs (One per line)</span>
//                         <textarea
//                             value={postLogoutUris}
//                             onChange={(e) => setPostLogoutUris(e.target.value)}
//                             rows={1}
//                             placeholder="http://localhost:3000"
//                             className="rounded-lg border border-slate-200 p-2 font-mono text-xs dark:border-slate-700 dark:bg-slate-950"
//                         />
//                     </label>
//
//                     <div className="grid grid-cols-2 gap-3">
//                         <div>
//                             <span
//                                 className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Grant Types:</span>
//                             <div className="grid gap-1">
//                                 {ALL_GRANT_TYPES.map((gt) => (
//                                     <label key={gt.id} className="flex items-center gap-2 cursor-pointer">
//                                         <input
//                                             type="checkbox"
//                                             checked={grantTypes.includes(gt.id)}
//                                             onChange={() => toggleGrantType(gt.id)}
//                                             className="rounded text-violet-600"
//                                         />
//                                         <span className="text-[11px]">{gt.label}</span>
//                                     </label>
//                                 ))}
//                             </div>
//                         </div>
//
//                         <div>
//                             <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Scopes:</span>
//                             <div className="grid grid-cols-2 gap-1">
//                                 {ALL_SCOPES.map((sc) => (
//                                     <label key={sc} className="flex items-center gap-2 cursor-pointer">
//                                         <input
//                                             type="checkbox"
//                                             checked={scopes.includes(sc)}
//                                             onChange={() => toggleScope(sc)}
//                                             className="rounded text-violet-600"
//                                         />
//                                         <span className="text-[11px] font-mono">{sc}</span>
//                                     </label>
//                                 ))}
//                             </div>
//                         </div>
//                     </div>
//
//                     <div className="flex gap-4 border-t border-slate-100 pt-2 dark:border-slate-800">
//                         <label className="flex items-center gap-2 cursor-pointer">
//                             <input
//                                 type="checkbox"
//                                 checked={requirePkce}
//                                 onChange={(e) => setRequirePkce(e.target.checked)}
//                                 className="rounded text-violet-600"
//                             />
//                             <span className="text-[11px] font-medium">Require PKCE (S256)</span>
//                         </label>
//                         <label className="flex items-center gap-2 cursor-pointer">
//                             <input
//                                 type="checkbox"
//                                 checked={requireConsent}
//                                 onChange={(e) => setRequireConsent(e.target.checked)}
//                                 className="rounded text-violet-600"
//                             />
//                             <span className="text-[11px] font-medium">Require User Consent</span>
//                         </label>
//                     </div>
//
//                     <footer
//                         className="mt-3 flex justify-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
//                         <button
//                             type="button"
//                             onClick={close}
//                             className="h-9 rounded-lg border border-slate-200 px-3 text-xs font-medium hover:bg-slate-50 dark:border-slate-700 cursor-pointer"
//                         >
//                             Cancel
//                         </button>
//                         <button
//                             disabled={busy}
//                             type="submit"
//                             className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-violet-700 px-4 text-xs font-semibold text-white hover:bg-violet-800 disabled:opacity-60 cursor-pointer"
//                         >
//                             {busy ? <LoaderCircle className="size-3.5 animate-spin"/> : <Layers className="size-3.5"/>}
//                             {busy ? 'Registering…' : 'Register Client'}
//                         </button>
//                     </footer>
//                 </form>
//             </div>
//         </div>
//     )
// }


import {useEffect, useId, useRef, useState} from 'react'
import {CircleAlert, Layers, LoaderCircle, RefreshCw, X} from 'lucide-react'
import {adminApi} from '../../../features/admin/api/adminApi'
import {clientSchema, validateForm} from '../../../utils/validation'

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

const emptyForm = () => ({
    clientName: '',
    clientId: '',
    clientSecret: '',
    authMethod: 'client_secret_basic',
    grantTypes: ['authorization_code', 'refresh_token'],
    redirectUris: 'http://localhost:3000/callback',
    postLogoutUris: 'http://localhost:3000',
    scopes: ['openid', 'profile', 'email'],
    requirePkce: true,
    requireConsent: true,
})

const splitLines = (value) =>
    value
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)

const inputBase =
    'h-9 w-full min-w-0 rounded-lg border bg-white px-3 text-xs font-normal outline-none placeholder:text-slate-400 focus-visible:ring-2 disabled:opacity-60 dark:bg-slate-950 dark:placeholder:text-slate-500'
const textareaBase =
    'w-full min-w-0 resize-y rounded-lg border bg-white px-3 py-2 font-mono text-[11px] font-normal leading-relaxed outline-none placeholder:text-slate-400 focus-visible:ring-2 disabled:opacity-60 dark:bg-slate-950 dark:placeholder:text-slate-500'
const inputOk = 'border-slate-200 focus-visible:ring-violet-500 dark:border-slate-700'
const inputBad = 'border-red-500 focus-visible:ring-red-500'
const labelBase = 'grid min-w-0 gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300'
const hintClass = 'text-[11px] font-normal text-slate-500 dark:text-slate-400'
const checkboxClass = 'size-4 shrink-0 cursor-pointer accent-violet-700'

export default function CreateClientDialog({open, onClose, onCreated, t = {}}) {
    const dialogRef = useRef(null)
    const idPrefix = useId()

    const [form, setForm] = useState(emptyForm)
    const [busy, setBusy] = useState(false)
    const [formError, setFormError] = useState('')
    const [fieldErrors, setFieldErrors] = useState({})

    // Native <dialog>: focus trap, Esc, inert background, correct a11y semantics.
    useEffect(() => {
        const dialog = dialogRef.current
        if (!dialog) return
        if (open && !dialog.open) dialog.showModal()
        if (!open && dialog.open) dialog.close()
    }, [open])

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
        // Cryptographically secure: Math.random() must not be used for secrets.
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'
        const bytes = new Uint8Array(32)
        crypto.getRandomValues(bytes)
        let secret = 'sec_'
        for (const byte of bytes) secret += chars[byte % chars.length]
        update('clientSecret', secret)
    }

    function close() {
        if (busy) return // don't discard a request that's in flight
        setForm(emptyForm())
        setFormError('')
        setFieldErrors({})
        onClose()
    }

    async function submit(event) {
        event.preventDefault()
        if (busy) return
        setFormError('')
        setFieldErrors({})

        const clientName = form.clientName.trim()
        const clientId = form.clientId.trim()
        const clientSecret = form.clientSecret.trim()

        const validation = validateForm(clientSchema, {
            clientId: clientId || 'auto-generated',
            clientName,
            redirectUris: form.redirectUris.trim(),
        })
        if (!validation.success) {
            setFieldErrors(validation.errors)
            return
        }

        setBusy(true)
        try {
            await adminApi.createClient({
                clientName,
                clientId: clientId || undefined,
                clientSecret: clientSecret || undefined,
                clientAuthenticationMethods: [form.authMethod],
                authorizationGrantTypes: form.grantTypes,
                redirectUris: splitLines(form.redirectUris),
                postLogoutRedirectUris: splitLines(form.postLogoutUris),
                scopes: form.scopes,
                clientSettings: {
                    'settings.client.require-proof-key': form.requirePkce,
                    'settings.client.require-authorization-consent': form.requireConsent,
                },
            })
            setForm(emptyForm())
            onClose()
            onCreated()
        } catch (requestError) {
            setFormError(requestError.message || t.adminClientCreateError || 'Failed to register client.')
        } finally {
            setBusy(false)
        }
    }

    const titleId = `${idPrefix}-title`
    const title = t.adminRegisterClient || 'Register OAuth2 client'
    const nameError = fieldErrors.clientName
    const idError = fieldErrors.clientId
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
            // Wide enough that the form fits without an inner scroll area.
            // If the screen is very short, the dialog itself scrolls as a fallback.
            className="m-auto max-h-[calc(100dvh-2rem)] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-xs open:animate-in open:fade-in open:zoom-in-95 open:duration-150 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
        >
            <form onSubmit={submit} noValidate className="grid gap-4 p-6">
                <header className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                        <Layers aria-hidden="true" className="size-5 text-violet-700 dark:text-violet-400"/>
                        <h2 id={titleId} className="text-base font-semibold">{title}</h2>
                    </div>
                    <button
                        type="button"
                        onClick={close}
                        aria-label={t.close || 'Close'}
                        className="cursor-pointer rounded-md p-1 text-slate-400 hover:text-slate-600 focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:outline-none dark:hover:text-slate-200"
                    >
                        <X aria-hidden="true" className="size-4"/>
                    </button>
                </header>

                {formError && (
                    <div
                        role="alert"
                        className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-100"
                    >
                        <CircleAlert aria-hidden="true" className="size-4 shrink-0"/>
                        <span>{formError}</span>
                    </div>
                )}

                <label className={labelBase}>
                    <span>{t.adminClientName || 'Application name'}</span>
                    <input
                        type="text"
                        value={form.clientName}
                        onChange={(event) => update('clientName', event.target.value)}
                        placeholder={t.adminClientNamePlaceholder || 'e.g. Mobile iOS app'}
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
                        <span>{t.adminClientId || 'Client ID'}</span>
                        <input
                            type="text"
                            value={form.clientId}
                            onChange={(event) => update('clientId', event.target.value)}
                            placeholder={t.adminClientIdPlaceholder || 'Leave blank to auto-generate'}
                            autoComplete="off"
                            autoCapitalize="none"
                            spellCheck={false}
                            aria-invalid={idError ? 'true' : undefined}
                            aria-describedby={idError ? `${idPrefix}-id-error` : undefined}
                            disabled={busy}
                            className={`${inputBase} font-mono text-[11px] ${idError ? inputBad : inputOk}`}
                        />
                        {idError && (
                            <span id={`${idPrefix}-id-error`} className="text-[11px] font-normal text-red-500">
                                {idError}
                            </span>
                        )}
                    </label>

                    {/* Button sits outside the <label> so it has its own accessible name */}
                    <div className={labelBase}>
                        <label htmlFor={`${idPrefix}-secret`}>{t.adminClientSecret || 'Client secret'}</label>
                        <div className="flex min-w-0 gap-2">
                            <input
                                id={`${idPrefix}-secret`}
                                type="text"
                                value={form.clientSecret}
                                onChange={(event) => update('clientSecret', event.target.value)}
                                placeholder={t.adminClientSecretPlaceholder || 'Optional for public clients'}
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
                                <RefreshCw aria-hidden="true" className="size-3.5"/>
                                {t.adminGenerate || 'Generate'}
                            </button>
                        </div>
                    </div>
                </div>

                <label className={labelBase}>
                    <span>{t.adminAuthMethod || 'Authentication method'}</span>
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
                        <span>{t.adminRedirectUris || 'Redirect URIs'}</span>
                        <textarea
                            value={form.redirectUris}
                            onChange={(event) => update('redirectUris', event.target.value)}
                            rows={3}
                            placeholder="https://app.example.com/callback"
                            spellCheck={false}
                            aria-required="true"
                            aria-invalid={uriError ? 'true' : undefined}
                            aria-describedby={`${idPrefix}-uri-hint${uriError ? ` ${idPrefix}-uri-error` : ''}`}
                            disabled={busy}
                            className={`${textareaBase} ${uriError ? inputBad : inputOk}`}
                        />
                        <span id={`${idPrefix}-uri-hint`} className={hintClass}>
                            {t.adminOnePerLine || 'One per line'}
                        </span>
                        {uriError && (
                            <span id={`${idPrefix}-uri-error`} className="text-[11px] font-normal text-red-500">
                                {uriError}
                            </span>
                        )}
                    </label>

                    <label className={labelBase}>
                        <span>{t.adminPostLogoutUris || 'Post-logout redirect URIs'}</span>
                        <textarea
                            value={form.postLogoutUris}
                            onChange={(event) => update('postLogoutUris', event.target.value)}
                            rows={3}
                            placeholder="https://app.example.com"
                            spellCheck={false}
                            aria-describedby={`${idPrefix}-post-hint`}
                            disabled={busy}
                            className={`${textareaBase} ${inputOk}`}
                        />
                        <span id={`${idPrefix}-post-hint`} className={hintClass}>
                            {t.adminOnePerLine || 'One per line'}
                        </span>
                    </label>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-[repeat(2,minmax(0,1fr))]">
                    <fieldset disabled={busy} className="grid min-w-0 content-start gap-2">
                        <legend className="mb-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                            {t.adminGrantTypes || 'Grant types'}
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
                            {t.adminScopes || 'Scopes'}
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
                    <legend className="sr-only">{t.adminSecurityOptions || 'Security options'}</legend>
                    <label className="flex cursor-pointer items-center gap-2 text-xs">
                        <input
                            type="checkbox"
                            checked={form.requirePkce}
                            onChange={(event) => update('requirePkce', event.target.checked)}
                            className={checkboxClass}
                        />
                        <span>{t.adminRequirePkce || 'Require PKCE (S256)'}</span>
                    </label>
                    <label className="flex cursor-pointer items-center gap-2 text-xs">
                        <input
                            type="checkbox"
                            checked={form.requireConsent}
                            onChange={(event) => update('requireConsent', event.target.checked)}
                            className={checkboxClass}
                        />
                        <span>{t.adminRequireConsent || 'Require user consent'}</span>
                    </label>
                </fieldset>

                <footer className="flex justify-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                    <button
                        type="button"
                        onClick={close}
                        disabled={busy}
                        className="h-9 cursor-pointer rounded-lg border border-slate-200 px-3 text-xs font-medium hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:outline-none disabled:opacity-60 dark:border-slate-700 dark:hover:bg-slate-800"
                    >
                        {t.cancel || 'Cancel'}
                    </button>
                    <button
                        type="submit"
                        disabled={busy}
                        aria-busy={busy}
                        className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg bg-violet-700 px-4 text-xs font-semibold text-white hover:bg-violet-800 focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-60"
                    >
                        {busy
                            ? <LoaderCircle aria-hidden="true" className="size-3.5 animate-spin"/>
                            : <Layers aria-hidden="true" className="size-3.5"/>}
                        {busy ? (t.adminRegistering || 'Registering…') : (t.adminRegisterClientAction || 'Register client')}
                    </button>
                </footer>
            </form>
        </dialog>
    )
}