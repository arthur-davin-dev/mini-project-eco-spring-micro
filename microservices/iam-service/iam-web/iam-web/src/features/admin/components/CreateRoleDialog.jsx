import {useEffect, useState} from 'react'
import {CircleAlert, LoaderCircle, ShieldCheck, X} from 'lucide-react'
import {adminApi} from '../api/adminApi'
import {createRoleSchema, validateForm} from '../../../utils/validation'

export default function CreateRoleDialog({open, onClose, onCreated, token, t, locale}) {
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [permissions, setPermissions] = useState([])
    const [selectedPermissions, setSelectedPermissions] = useState([])
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState('')
    const [fieldErrors, setFieldErrors] = useState({})

    useEffect(() => {
        if (open) {
            adminApi.listPermissions(token, {page: 0, size: 100}).then((data) => {
                setPermissions(data?.content || [])
            }).catch(() => {
            })
        }
    }, [open, token])

    if (!open) return null

    function togglePermission(permUuid) {
        setSelectedPermissions((curr) =>
            curr.includes(permUuid) ? curr.filter((id) => id !== permUuid) : [...curr, permUuid]
        )
    }

    function close() {
        setName('')
        setDescription('')
        setSelectedPermissions([])
        setError('')
        setFieldErrors({})
        onClose()
    }

    async function submit(event) {
        event.preventDefault()
        setError('')
        setFieldErrors({})

        const validation = validateForm(createRoleSchema, {name, description})
        if (!validation.success) {
            setFieldErrors(validation.errors)
            setError(validation.firstErrorMessage)
            return
        }

        setBusy(true)
        try {
            await adminApi.createRole(token, {
                name: name.trim().toUpperCase(),
                description: description.trim(),
                permissionUuids: selectedPermissions,
            })
            close()
            onCreated()
        } catch (requestError) {
            setError(
                requestError.status === 409
                    ? (t.adminRoleConflict || 'A role with this name already exists.')
                    : requestError.status === 403
                        ? t.adminForbidden
                        : (t.adminRoleCreateError || 'Failed to create role.')
            )
        } finally {
            setBusy(false)
        }
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
            <div
                className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 my-auto animate-in zoom-in-95 duration-150">
                <header
                    className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <ShieldCheck className="size-5 text-violet-600"/>
                        {t.adminCreateRole || 'Create Role'}
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
                    <label className="grid gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <span>{t.adminRoleName || 'Role Name (e.g. MANAGER, EDITOR)'}</span>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value)
                                if (fieldErrors.name) setFieldErrors(curr => ({...curr, name: undefined}))
                            }}
                            placeholder="ROLE_NAME"
                            required
                            className={`h-9 rounded-lg border px-3 text-xs uppercase dark:bg-slate-950 ${
                                fieldErrors.name
                                    ? 'border-red-500 focus-visible:ring-red-500'
                                    : 'border-slate-200 dark:border-slate-700'
                            }`}
                        />
                        {fieldErrors.name && (
                            <span className="text-[11px] font-normal text-red-500">{fieldErrors.name}</span>
                        )}
                    </label>

                    <label className="grid gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <span>{t.description || 'Description'}</span>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Role purpose and responsibility"
                            className="h-9 rounded-lg border border-slate-200 px-3 text-xs dark:border-slate-700 dark:bg-slate-950"
                        />
                    </label>

                    <div>
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                            {locale === 'km' ? 'ផ្តល់សិទ្ធិដំបូង:' : 'Assign Initial Permissions:'}
                        </span>
                        <div
                            className="max-h-48 overflow-y-auto rounded-lg border border-slate-200 p-2 text-xs dark:border-slate-700 dark:bg-slate-950 grid grid-cols-2 gap-1.5">
                            {permissions.map((p) => {
                                const checked = selectedPermissions.includes(p.uuid)
                                return (
                                    <label
                                        key={p.uuid}
                                        className={`flex items-center gap-2 p-1.5 rounded cursor-pointer transition ${
                                            checked ? 'bg-violet-50 text-violet-800 dark:bg-violet-950/60 dark:text-violet-200' : 'hover:bg-slate-50 dark:hover:bg-slate-900'
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={checked}
                                            onChange={() => togglePermission(p.uuid)}
                                            className="rounded text-violet-600 focus:ring-violet-500"
                                        />
                                        <span className="font-mono text-[11px] truncate" title={p.name}>
                                            {p.name || `${p.resource}:${p.action}`}
                                        </span>
                                    </label>
                                )
                            })}
                        </div>
                    </div>

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
                                <ShieldCheck className="size-3.5"/>}
                            {busy ? (locale === 'km' ? 'កំពុងបង្កើត...' : 'Creating…') : (t.adminCreateRole || 'Create Role')}
                        </button>
                    </footer>
                </form>
            </div>
        </div>
    )
}
