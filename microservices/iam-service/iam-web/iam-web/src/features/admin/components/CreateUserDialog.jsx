// import {useState} from 'react'
// import {CircleAlert, LoaderCircle, UserPlus, X} from 'lucide-react'
// import {adminApi} from '../api/adminApi'
// import {createUserSchema, validateForm} from '../../../utils/validation'
//
// export default function CreateUserDialog({open, onClose, onCreated, token, t, locale}) {
//     const [form, setForm] = useState({
//         username: '',
//         email: '',
//         givenName: '',
//         familyName: '',
//         password: '',
//         confirmPassword: '',
//         locale: 'en',
//     })
//     const [fieldErrors, setFieldErrors] = useState({})
//     const [busy, setBusy] = useState(false)
//     const [error, setError] = useState('')
//
//     if (!open) return null
//
//     function update(field, value) {
//         setForm((current) => ({...current, [field]: value}))
//         if (fieldErrors[field]) {
//             setFieldErrors((current) => {
//                 const updated = {...current}
//                 delete updated[field]
//                 return updated
//             })
//         }
//     }
//
//     function close() {
//         setForm({
//             username: '',
//             email: '',
//             givenName: '',
//             familyName: '',
//             password: '',
//             confirmPassword: '',
//             locale: 'en',
//         })
//         setFieldErrors({})
//         setError('')
//         onClose()
//     }
//
//     async function submit(event) {
//         event.preventDefault()
//         setError('')
//         setFieldErrors({})
//
//         const validation = validateForm(createUserSchema, form)
//         if (!validation.success) {
//             setFieldErrors(validation.errors)
//             setError(validation.firstErrorMessage)
//             return
//         }
//
//         setBusy(true)
//         try {
//             await adminApi.createUser(token, {
//                 username: form.username.trim(),
//                 email: form.email.trim(),
//                 givenName: form.givenName.trim(),
//                 familyName: form.familyName.trim(),
//                 password: form.password,
//                 confirmPassword: form.confirmPassword,
//                 locale: form.locale,
//             })
//             close()
//             onCreated()
//         } catch (requestError) {
//             setError(
//                 requestError.status === 409
//                     ? (t.adminUserConflict || 'A user with this username or email already exists.')
//                     : requestError.status === 403
//                         ? t.adminForbidden
//                         : (t.adminCreateError || 'Failed to create user.')
//             )
//         } finally {
//             setBusy(false)
//         }
//     }
//
//     const fields = [
//         ['username', t.username || 'Username', 'text', 'username'],
//         ['email', t.email || 'Email', 'email', 'email'],
//         ['givenName', t.firstName || 'First name', 'text', 'given-name'],
//         ['familyName', t.lastName || 'Last name', 'text', 'family-name'],
//         ['password', t.adminTemporaryPassword || 'Temporary password', 'password', 'new-password'],
//         ['confirmPassword', t.confirmPassword || 'Confirm password', 'password', 'new-password'],
//     ]
//
//     return (
//         <div
//             className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
//             <div
//                 className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 my-auto animate-in zoom-in-95 duration-150">
//                 <form onSubmit={submit} className="grid gap-4">
//                     <header
//                         className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
//                         <div className="flex items-center gap-2">
//                             <UserPlus className="size-5 text-violet-700 dark:text-violet-400"/>
//                             <h2 className="text-base font-semibold">{t.adminCreateUser || 'Create User'}</h2>
//                         </div>
//                         <button
//                             type="button"
//                             onClick={close}
//                             className="text-sm font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
//                         >
//                             <X className="size-4"/>
//                         </button>
//                     </header>
//
//                     {error && (
//                         <div role="alert"
//                              className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-100">
//                             <CircleAlert className="size-4 shrink-0"/>
//                             <span>{error}</span>
//                         </div>
//                     )}
//
//                     <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
//                         {fields.map(([name, label, type, auto]) => (
//                             <label key={name}
//                                    className="grid gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
//                                 <span>{label}</span>
//                                 <input
//                                     type={type}
//                                     value={form[name]}
//                                     onChange={(event) => update(name, event.target.value)}
//                                     autoComplete={auto}
//                                     required
//                                     className={`h-9 rounded-lg border px-3 text-xs outline-none focus-visible:ring-2 dark:bg-slate-950 ${
//                                         fieldErrors[name]
//                                             ? 'border-red-500 focus-visible:ring-red-500'
//                                             : 'border-slate-200 focus-visible:ring-violet-500 dark:border-slate-700'
//                                     }`}
//                                 />
//                                 {fieldErrors[name] && (
//                                     <span className="text-[11px] font-normal text-red-500">{fieldErrors[name]}</span>
//                                 )}
//                             </label>
//                         ))}
//                     </div>
//
//                     <label className="grid gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
//                         <span>{t.language || 'Language'}</span>
//                         <select
//                             value={form.locale}
//                             onChange={(event) => update('locale', event.target.value)}
//                             className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs outline-none focus-visible:ring-2 focus-visible:ring-violet-500 dark:border-slate-700 dark:bg-slate-950"
//                         >
//                             <option value="en">{t.english || 'English'}</option>
//                             <option value="km">{t.khmer || 'Khmer'}</option>
//                         </select>
//                     </label>
//
//                     <footer className="flex justify-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
//                         <button
//                             type="button"
//                             onClick={close}
//                             className="h-9 rounded-lg border border-slate-200 px-3 text-xs font-medium hover:bg-slate-50 dark:border-slate-700 cursor-pointer"
//                         >
//                             {t.cancel || 'Cancel'}
//                         </button>
//                         <button
//                             disabled={busy}
//                             type="submit"
//                             className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-violet-700 px-4 text-xs font-semibold text-white hover:bg-violet-800 disabled:opacity-60 cursor-pointer"
//                         >
//                             {busy ? <LoaderCircle className="size-3.5 animate-spin"/> :
//                                 <UserPlus className="size-3.5"/>}
//                             {busy ? (locale === 'km' ? 'កំពុងបង្កើត...' : 'Creating…') : (t.adminCreateUser || 'Create User')}
//                         </button>
//                     </footer>
//                 </form>
//             </div>
//         </div>
//     )
// }


import {useEffect, useId, useRef, useState} from 'react'
import {CircleAlert, LoaderCircle, UserPlus, X} from 'lucide-react'
import {adminApi} from '../api/adminApi'
import {createUserSchema, validateForm} from '../../../utils/validation'

const emptyForm = (locale = 'en') => ({
    username: '',
    email: '',
    givenName: '',
    familyName: '',
    password: '',
    confirmPassword: '',
    locale,
})

const trimmed = ['username', 'email', 'givenName', 'familyName']

// Field definitions live outside the component: they never change between renders.
function buildFields(t) {
    return [
        {name: 'username', label: t.username || 'Username', type: 'text', autoComplete: 'username'},
        {name: 'email', label: t.email || 'Email', type: 'email', autoComplete: 'email'},
        {name: 'givenName', label: t.firstName || 'First name', type: 'text', autoComplete: 'given-name'},
        {name: 'familyName', label: t.lastName || 'Last name', type: 'text', autoComplete: 'family-name'},
        {name: 'password', label: t.adminTemporaryPassword || 'Temporary password', type: 'password', autoComplete: 'new-password'},
        {name: 'confirmPassword', label: t.confirmPassword || 'Confirm password', type: 'password', autoComplete: 'new-password'},
    ]
}

export default function CreateUserDialog({open, onClose, onCreated, token, t, locale}) {
    const dialogRef = useRef(null)
    const idPrefix = useId()

    // New users default to the admin's current UI language.
    const [form, setForm] = useState(() => emptyForm(locale === 'km' ? 'km' : 'en'))
    const [fieldErrors, setFieldErrors] = useState({})
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState('')

    // Use the native <dialog>: it gives us focus trapping, Esc handling,
    // inert background and correct a11y semantics for free.
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

    function close() {
        if (busy) return // don't discard a request that's in flight
        setForm(emptyForm(locale === 'km' ? 'km' : 'en'))
        setFieldErrors({})
        setError('')
        onClose()
    }

    async function submit(event) {
        event.preventDefault()
        if (busy) return
        setError('')
        setFieldErrors({})

        // Normalize once, then validate and send the same values.
        const values = {...form}
        for (const key of trimmed) values[key] = form[key].trim()

        const validation = validateForm(createUserSchema, values)
        if (!validation.success) {
            setFieldErrors(validation.errors)
            return
        }

        setBusy(true)
        try {
            await adminApi.createUser(token, values)
            setForm(emptyForm(values.locale))
            onClose()
            onCreated()
        } catch (requestError) {
            if (requestError.status === 409) {
                setError(t.adminUserConflict || 'A user with this username or email already exists.')
            } else if (requestError.status === 403) {
                setError(t.adminForbidden || 'You do not have permission to create users.')
            } else {
                setError(t.adminCreateError || 'Failed to create user.')
            }
        } finally {
            setBusy(false)
        }
    }

    const fields = buildFields(t)
    const titleId = `${idPrefix}-title`
    const createLabel = t.adminCreateUser || 'Create User'

    return (
        <dialog
            ref={dialogRef}
            aria-labelledby={titleId}
            onCancel={(event) => {
                // Esc: let our close() decide (it refuses while busy)
                event.preventDefault()
                close()
            }}
            onClick={(event) => {
                // Clicks on the backdrop land on the <dialog> itself
                if (event.target === dialogRef.current) close()
            }}
            className="m-auto w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-xs open:animate-in open:fade-in open:zoom-in-95 open:duration-150 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
        >
            <form onSubmit={submit} noValidate className="grid gap-4 p-6">
                <header className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                        <UserPlus aria-hidden="true" className="size-5 text-violet-700 dark:text-violet-400"/>
                        <h2 id={titleId} className="text-base font-semibold">{createLabel}</h2>
                    </div>
                    <button
                        type="button"
                        onClick={close}
                        aria-label={t.close || 'Close'}
                        className="rounded-md p-1 text-slate-400 hover:text-slate-600 focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:outline-none dark:hover:text-slate-200 cursor-pointer"
                    >
                        <X aria-hidden="true" className="size-4"/>
                    </button>
                </header>

                {/* Server-level errors only; field errors show next to their inputs */}
                {error && (
                    <div
                        role="alert"
                        className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-100"
                    >
                        <CircleAlert aria-hidden="true" className="size-4 shrink-0"/>
                        <span>{error}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-[repeat(2,minmax(0,1fr))]">
                    {fields.map(({name, label, type, autoComplete}, index) => {
                        const errorId = `${idPrefix}-${name}-error`
                        const message = fieldErrors[name]
                        return (
                            <label
                                key={name}
                                className="grid min-w-0 gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300"
                            >
                                <span>{label}</span>
                                <input
                                    type={type}
                                    value={form[name]}
                                    onChange={(event) => update(name, event.target.value)}
                                    autoComplete={autoComplete}
                                    autoFocus={index === 0}
                                    aria-required="true"
                                    aria-invalid={message ? 'true' : undefined}
                                    aria-describedby={message ? errorId : undefined}
                                    disabled={busy}
                                    className={`h-9 w-full min-w-0 rounded-lg border px-3 text-xs outline-none focus-visible:ring-2 disabled:opacity-60 dark:bg-slate-950 ${
                                        message
                                            ? 'border-red-500 focus-visible:ring-red-500'
                                            : 'border-slate-200 focus-visible:ring-violet-500 dark:border-slate-700'
                                    }`}
                                />
                                {message && (
                                    <span id={errorId} className="text-[11px] font-normal text-red-500">
                                        {message}
                                    </span>
                                )}
                            </label>
                        )
                    })}
                </div>

                <label className="grid gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span>{t.language || 'Language'}</span>
                    <select
                        value={form.locale}
                        onChange={(event) => update('locale', event.target.value)}
                        disabled={busy}
                        className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs outline-none focus-visible:ring-2 focus-visible:ring-violet-500 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950"
                    >
                        <option value="en">{t.english || 'English'}</option>
                        <option value="km">{t.khmer || 'Khmer'}</option>
                    </select>
                </label>

                <footer className="flex justify-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                    <button
                        type="button"
                        onClick={close}
                        disabled={busy}
                        className="h-9 rounded-lg border border-slate-200 px-3 text-xs font-medium hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:outline-none disabled:opacity-60 dark:border-slate-700 dark:hover:bg-slate-800 cursor-pointer"
                    >
                        {t.cancel || 'Cancel'}
                    </button>
                    <button
                        type="submit"
                        disabled={busy}
                        aria-busy={busy}
                        className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-violet-700 px-4 text-xs font-semibold text-white hover:bg-violet-800 focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-60 cursor-pointer"
                    >
                        {busy
                            ? <LoaderCircle aria-hidden="true" className="size-3.5 animate-spin"/>
                            : <UserPlus aria-hidden="true" className="size-3.5"/>}
                        {busy ? (t.adminCreating || 'Creating…') : createLabel}
                    </button>
                </footer>
            </form>
        </dialog>
    )
}