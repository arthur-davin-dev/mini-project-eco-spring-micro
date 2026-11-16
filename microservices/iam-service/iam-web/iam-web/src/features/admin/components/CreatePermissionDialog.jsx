import {useState} from 'react'
import {CircleAlert, KeyRound, LoaderCircle, X} from 'lucide-react'
import {adminApi} from '../api/adminApi'
import {createPermissionSchema, validateForm} from '../../../utils/validation'

export default function CreatePermissionDialog({open, onClose, onCreated, token, t, locale}) {
    const [resource, setResource] = useState('')
    const [action, setAction] = useState('')
    const [description, setDescription] = useState('')
    const [scopeConstraint, setScopeConstraint] = useState('ALL')
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState('')
    const [fieldErrors, setFieldErrors] = useState({})

    if (!open) return null

    function close() {
        setResource('')
        setAction('')
        setDescription('')
        setError('')
        setFieldErrors({})
        onClose()
    }

    async function submit(event) {
        event.preventDefault()
        setError('')
        setFieldErrors({})

        const res = resource.trim().toLowerCase()
        const act = action.trim().toLowerCase()
        const validation = validateForm(createPermissionSchema, {resource: res, action: act, description})
        if (!validation.success) {
            setFieldErrors(validation.errors)
            setError(validation.firstErrorMessage)
            return
        }

        setBusy(true)
        try {
            await adminApi.createPermission(token, {
                resource: res,
                action: act,
                name: `${res}:${act}`,
                description: description.trim() || `Permission ${res}:${act} with ${scopeConstraint} access`,
            })
            close()
            onCreated()
        } catch (requestError) {
            setError(
                requestError.status === 409
                    ? (t.adminPermissionConflict || 'This permission already exists.')
                    : requestError.status === 403
                        ? t.adminForbidden
                        : (t.adminPermissionCreateError || 'Failed to create permission.')
            )
        } finally {
            setBusy(false)
        }
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
            <div
                className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 my-auto animate-in zoom-in-95 duration-150">
                <header
                    className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <KeyRound className="size-5 text-violet-600"/>
                        {t.adminCreatePermission || 'Create Permission'}
                    </h3>
                    <button onClick={close}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
                        <X className="size-4"/>
                    </button>
                </header>

                {error && (
                    <div
                        className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-700 dark:bg-red-950 dark:text-red-300">
                        <CircleAlert className="size-4 shrink-0"/>
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={submit} className="mt-4 grid gap-3">
                    <div className="grid grid-cols-2 gap-3">
                        <label className="grid gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                            <span>{t.adminResource || 'Resource (e.g. order, user)'}</span>
                            <input
                                type="text"
                                value={resource}
                                onChange={(e) => {
                                    setResource(e.target.value)
                                    if (fieldErrors.resource) setFieldErrors(curr => ({...curr, resource: undefined}))
                                }}
                                placeholder="resource"
                                required
                                className={`h-9 rounded-lg border px-3 text-xs dark:bg-slate-950 ${
                                    fieldErrors.resource
                                        ? 'border-red-500 focus-visible:ring-red-500'
                                        : 'border-slate-200 dark:border-slate-700'
                                }`}
                            />
                            {fieldErrors.resource && (
                                <span className="text-[11px] font-normal text-red-500">{fieldErrors.resource}</span>
                            )}
                        </label>

                        <label className="grid gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                            <span>{t.adminAction || 'Action (e.g. read, write)'}</span>
                            <input
                                type="text"
                                value={action}
                                onChange={(e) => {
                                    setAction(e.target.value)
                                    if (fieldErrors.action) setFieldErrors(curr => ({...curr, action: undefined}))
                                }}
                                placeholder="action"
                                required
                                className={`h-9 rounded-lg border px-3 text-xs dark:bg-slate-950 ${
                                    fieldErrors.action
                                        ? 'border-red-500 focus-visible:ring-red-500'
                                        : 'border-slate-200 dark:border-slate-700'
                                }`}
                            />
                            {fieldErrors.action && (
                                <span className="text-[11px] font-normal text-red-500">{fieldErrors.action}</span>
                            )}
                        </label>
                    </div>

                    <label className="grid gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <span>{locale === 'km' ? 'កម្រិតសិទ្ធិ (Scope Constraint):' : 'Scope Constraint:'}</span>
                        <select
                            value={scopeConstraint}
                            onChange={(e) => setScopeConstraint(e.target.value)}
                            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs dark:border-slate-700 dark:bg-slate-950"
                        >
                            <option value="ALL">ALL — Global access</option>
                            <option value="OWN">OWN — Tenant / user owned only</option>
                            <option value="DEPARTMENT">DEPARTMENT — Departmental scope</option>
                        </select>
                    </label>

                    <label className="grid gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <span>{t.description || 'Description'}</span>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Permission scope and intent"
                            className="h-9 rounded-lg border border-slate-200 px-3 text-xs dark:border-slate-700 dark:bg-slate-950"
                        />
                    </label>

                    <footer
                        className="mt-2 flex justify-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={close}
                            className="h-9 rounded-lg border border-slate-200 px-3 text-xs font-medium hover:bg-slate-50 dark:border-slate-700 cursor-pointer"
                        >
                            {t.cancel || 'Cancel'}
                        </button>
                        <button
                            disabled={busy}
                            type="submit"
                            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-violet-700 px-4 text-xs font-semibold text-white hover:bg-violet-800 disabled:opacity-60 cursor-pointer"
                        >
                            {busy ? <LoaderCircle className="size-3.5 animate-spin"/> :
                                <KeyRound className="size-3.5"/>}
                            {busy ? (locale === 'km' ? 'កំពុងបង្កើត...' : 'Creating…') : (t.adminCreatePermission || 'Create Permission')}
                        </button>
                    </footer>
                </form>
            </div>
        </div>
    )
}
