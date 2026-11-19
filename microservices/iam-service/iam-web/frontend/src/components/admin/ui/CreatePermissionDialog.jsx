// import {useState} from 'react'
// import {CircleAlert, KeyRound, LoaderCircle, X} from 'lucide-react'
// import {adminApi} from '../../../features/admin/api/adminApi'
// import {createPermissionSchema, validateForm} from '../../../utils/validation'
//
// export default function CreatePermissionDialog({open, onClose, onCreated, token, t, locale}) {
//     const [resource, setResource] = useState('')
//     const [action, setAction] = useState('')
//     const [description, setDescription] = useState('')
//     const [scopeConstraint, setScopeConstraint] = useState('ALL')
//     const [busy, setBusy] = useState(false)
//     const [error, setError] = useState('')
//     const [fieldErrors, setFieldErrors] = useState({})
//
//     if (!open) return null
//
//     function close() {
//         setResource('')
//         setAction('')
//         setDescription('')
//         setError('')
//         setFieldErrors({})
//         onClose()
//     }
//
//     async function submit(event) {
//         event.preventDefault()
//         setError('')
//         setFieldErrors({})
//
//         const res = resource.trim().toLowerCase()
//         const act = action.trim().toLowerCase()
//         const validation = validateForm(createPermissionSchema, {resource: res, action: act, description})
//         if (!validation.success) {
//             setFieldErrors(validation.errors)
//             setError(validation.firstErrorMessage)
//             return
//         }
//
//         setBusy(true)
//         try {
//             await adminApi.createPermission(token, {
//                 resource: res,
//                 action: act,
//                 name: `${res}:${act}`,
//                 description: description.trim() || `Permission ${res}:${act} with ${scopeConstraint} access`,
//             })
//             close()
//             onCreated()
//         } catch (requestError) {
//             setError(
//                 requestError.status === 409
//                     ? (t.adminPermissionConflict || 'This permission already exists.')
//                     : requestError.status === 403
//                         ? t.adminForbidden
//                         : (t.adminPermissionCreateError || 'Failed to create permission.')
//             )
//         } finally {
//             setBusy(false)
//         }
//     }
//
//     return (
//         <div
//             className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
//             <div
//                 className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 my-auto animate-in zoom-in-95 duration-150">
//                 <header
//                     className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
//                     <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
//                         <KeyRound className="size-5 text-violet-600"/>
//                         {t.adminCreatePermission || 'Create Permission'}
//                     </h3>
//                     <button onClick={close}
//                             className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
//                         <X className="size-4"/>
//                     </button>
//                 </header>
//
//                 {error && (
//                     <div
//                         className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-700 dark:bg-red-950 dark:text-red-300">
//                         <CircleAlert className="size-4 shrink-0"/>
//                         <span>{error}</span>
//                     </div>
//                 )}
//
//                 <form onSubmit={submit} className="mt-4 grid gap-3">
//                     <div className="grid grid-cols-2 gap-3">
//                         <label className="grid gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
//                             <span>{t.adminResource || 'Resource (e.g. order, user)'}</span>
//                             <input
//                                 type="text"
//                                 value={resource}
//                                 onChange={(e) => {
//                                     setResource(e.target.value)
//                                     if (fieldErrors.resource) setFieldErrors(curr => ({...curr, resource: undefined}))
//                                 }}
//                                 placeholder="resource"
//                                 required
//                                 className={`h-9 rounded-lg border px-3 text-xs dark:bg-slate-950 ${
//                                     fieldErrors.resource
//                                         ? 'border-red-500 focus-visible:ring-red-500'
//                                         : 'border-slate-200 dark:border-slate-700'
//                                 }`}
//                             />
//                             {fieldErrors.resource && (
//                                 <span className="text-[11px] font-normal text-red-500">{fieldErrors.resource}</span>
//                             )}
//                         </label>
//
//                         <label className="grid gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
//                             <span>{t.adminAction || 'Action (e.g. read, write)'}</span>
//                             <input
//                                 type="text"
//                                 value={action}
//                                 onChange={(e) => {
//                                     setAction(e.target.value)
//                                     if (fieldErrors.action) setFieldErrors(curr => ({...curr, action: undefined}))
//                                 }}
//                                 placeholder="action"
//                                 required
//                                 className={`h-9 rounded-lg border px-3 text-xs dark:bg-slate-950 ${
//                                     fieldErrors.action
//                                         ? 'border-red-500 focus-visible:ring-red-500'
//                                         : 'border-slate-200 dark:border-slate-700'
//                                 }`}
//                             />
//                             {fieldErrors.action && (
//                                 <span className="text-[11px] font-normal text-red-500">{fieldErrors.action}</span>
//                             )}
//                         </label>
//                     </div>
//
//                     <label className="grid gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
//                         <span>{locale === 'km' ? 'កម្រិតសិទ្ធិ (Scope Constraint):' : 'Scope Constraint:'}</span>
//                         <select
//                             value={scopeConstraint}
//                             onChange={(e) => setScopeConstraint(e.target.value)}
//                             className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs dark:border-slate-700 dark:bg-slate-950"
//                         >
//                             <option value="ALL">ALL — Global access</option>
//                             <option value="OWN">OWN — Tenant / user owned only</option>
//                             <option value="DEPARTMENT">DEPARTMENT — Departmental scope</option>
//                         </select>
//                     </label>
//
//                     <label className="grid gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
//                         <span>{t.description || 'Description'}</span>
//                         <input
//                             type="text"
//                             value={description}
//                             onChange={(e) => setDescription(e.target.value)}
//                             placeholder="Permission scope and intent"
//                             className="h-9 rounded-lg border border-slate-200 px-3 text-xs dark:border-slate-700 dark:bg-slate-950"
//                         />
//                     </label>
//
//                     <footer
//                         className="mt-2 flex justify-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
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
//                                 <KeyRound className="size-3.5"/>}
//                             {busy ? (locale === 'km' ? 'កំពុងបង្កើត...' : 'Creating…') : (t.adminCreatePermission || 'Create Permission')}
//                         </button>
//                     </footer>
//                 </form>
//             </div>
//         </div>
//     )
// }


import {useEffect, useId, useRef, useState} from 'react'
import {CircleAlert, KeyRound, LoaderCircle, X} from 'lucide-react'
import {adminApi} from '../../../features/admin/api/adminApi'
import {createPermissionSchema, validateForm} from '../../../utils/validation'

const emptyForm = () => ({resource: '', action: '', description: '', scopeConstraint: 'ALL'})

const inputBase =
    'h-9 w-full min-w-0 rounded-lg border bg-white px-3 text-xs font-normal outline-none placeholder:text-slate-400 focus-visible:ring-2 disabled:opacity-60 dark:bg-slate-950 dark:placeholder:text-slate-500'
const inputOk = 'border-slate-200 focus-visible:ring-violet-500 dark:border-slate-700'
const inputBad = 'border-red-500 focus-visible:ring-red-500'
const labelBase = 'grid min-w-0 gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300'

export default function CreatePermissionDialog({open, onClose, onCreated, token, t, locale}) {
    const dialogRef = useRef(null)
    const idPrefix = useId()

    const [form, setForm] = useState(emptyForm)
    const [fieldErrors, setFieldErrors] = useState({})
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState('')

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

    function close() {
        if (busy) return // don't discard a request that's in flight
        setForm(emptyForm())
        setFieldErrors({})
        setError('')
        onClose()
    }

    async function submit(event) {
        event.preventDefault()
        if (busy) return
        setError('')
        setFieldErrors({})

        const resource = form.resource.trim().toLowerCase()
        const action = form.action.trim().toLowerCase()
        const description = form.description.trim()

        const validation = validateForm(createPermissionSchema, {resource, action, description})
        if (!validation.success) {
            setFieldErrors(validation.errors)
            return
        }

        setBusy(true)
        try {
            await adminApi.createPermission(token, {
                resource,
                action,
                name: `${resource}:${action}`,
                description:
                    description || `Permission ${resource}:${action} with ${form.scopeConstraint} access`,
            })
            setForm(emptyForm())
            onClose()
            onCreated()
        } catch (requestError) {
            if (requestError.status === 409) {
                setError(t.adminPermissionConflict || 'This permission already exists.')
            } else if (requestError.status === 403) {
                setError(t.adminForbidden || 'You do not have permission to create permissions.')
            } else {
                setError(t.adminPermissionCreateError || 'Failed to create permission.')
            }
        } finally {
            setBusy(false)
        }
    }

    const titleId = `${idPrefix}-title`
    const createLabel = t.adminCreatePermission || 'Create Permission'

    const resourceError = fieldErrors.resource
    const actionError = fieldErrors.action
    const descriptionError = fieldErrors.description

    const previewResource = form.resource.trim().toLowerCase()
    const previewAction = form.action.trim().toLowerCase()
    const showPreview = previewResource || previewAction

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
            className="m-auto w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-xs open:animate-in open:fade-in open:zoom-in-95 open:duration-150 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
        >
            <form onSubmit={submit} noValidate className="grid gap-4 p-6">
                <header className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                        <KeyRound aria-hidden="true" className="size-5 text-violet-700 dark:text-violet-400"/>
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
                    <label className={labelBase}>
                        <span>{t.adminResourceLabel || 'Resource'}</span>
                        <input
                            type="text"
                            value={form.resource}
                            onChange={(event) => update('resource', event.target.value)}
                            placeholder={t.adminResourcePlaceholder || 'e.g. order, user'}
                            autoComplete="off"
                            autoCapitalize="none"
                            spellCheck={false}
                            autoFocus
                            aria-required="true"
                            aria-invalid={resourceError ? 'true' : undefined}
                            aria-describedby={resourceError ? `${idPrefix}-resource-error` : undefined}
                            disabled={busy}
                            className={`${inputBase} ${resourceError ? inputBad : inputOk}`}
                        />
                        {resourceError && (
                            <span id={`${idPrefix}-resource-error`} className="text-[11px] font-normal text-red-500">
                                {resourceError}
                            </span>
                        )}
                    </label>

                    <label className={labelBase}>
                        <span>{t.adminActionLabel || 'Action'}</span>
                        <input
                            type="text"
                            value={form.action}
                            onChange={(event) => update('action', event.target.value)}
                            placeholder={t.adminActionPlaceholder || 'e.g. read, write'}
                            autoComplete="off"
                            autoCapitalize="none"
                            spellCheck={false}
                            aria-required="true"
                            aria-invalid={actionError ? 'true' : undefined}
                            aria-describedby={actionError ? `${idPrefix}-action-error` : undefined}
                            disabled={busy}
                            className={`${inputBase} ${actionError ? inputBad : inputOk}`}
                        />
                        {actionError && (
                            <span id={`${idPrefix}-action-error`} className="text-[11px] font-normal text-red-500">
                                {actionError}
                            </span>
                        )}
                    </label>
                </div>

                {/* Live preview of the permission name that will be created */}
                {showPreview && (
                    <p className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:bg-slate-950 dark:text-slate-400">
                        <span>{t.adminPermissionName || 'Permission name'}:</span>
                        <code className="break-all rounded bg-violet-100 px-1.5 py-0.5 font-mono text-[11px] font-medium text-violet-800 dark:bg-violet-950 dark:text-violet-300">
                            {previewResource || 'resource'}:{previewAction || 'action'}
                        </code>
                    </p>
                )}

                <label className={labelBase}>
                    <span>{t.adminScopeConstraint || 'Scope'}</span>
                    <select
                        value={form.scopeConstraint}
                        onChange={(event) => update('scopeConstraint', event.target.value)}
                        disabled={busy}
                        className={`${inputBase} ${inputOk}`}
                    >
                        <option value="ALL">{t.adminScopeAll || 'All: global access'}</option>
                        <option value="OWN">{t.adminScopeOwn || 'Own: tenant or user-owned only'}</option>
                        <option value="DEPARTMENT">{t.adminScopeDepartment || 'Department: departmental scope'}</option>
                    </select>
                </label>

                <label className={labelBase}>
                    <span>
                        {t.description || 'Description'}{' '}
                        <span className="font-normal text-slate-400 dark:text-slate-500">
                            ({t.optional || 'optional'})
                        </span>
                    </span>
                    <input
                        type="text"
                        value={form.description}
                        onChange={(event) => update('description', event.target.value)}
                        placeholder={t.adminPermissionDescriptionPlaceholder || 'What this permission allows'}
                        autoComplete="off"
                        aria-invalid={descriptionError ? 'true' : undefined}
                        aria-describedby={descriptionError ? `${idPrefix}-description-error` : undefined}
                        disabled={busy}
                        className={`${inputBase} ${descriptionError ? inputBad : inputOk}`}
                    />
                    {descriptionError && (
                        <span id={`${idPrefix}-description-error`} className="text-[11px] font-normal text-red-500">
                            {descriptionError}
                        </span>
                    )}
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
                            : <KeyRound aria-hidden="true" className="size-3.5"/>}
                        {busy ? (t.adminCreating || 'Creating…') : createLabel}
                    </button>
                </footer>
            </form>
        </dialog>
    )
}