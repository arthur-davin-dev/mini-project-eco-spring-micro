import {useCallback, useEffect, useState} from 'react'
import {
    ArrowLeft,
    CircleAlert,
    Edit,
    KeyRound,
    Lock,
    PlusCircle,
    Power,
    ShieldCheck,
    Trash2,
    Unlock,
    LoaderCircle,
    Laptop,
    Check
} from 'lucide-react'
import {adminApi} from '../api/adminApi'
import Avatar from '../../../components/common/Avatar'
import {Badge} from '../../../components/ui/badge'
import {Button} from '../../../components/ui/button'
import {Card} from '../../../components/ui/card'
import {Input} from '../../../components/ui/input'

function safeFormatTime(val) {
    if (!val) return ''
    const d = new Date(val)
    if (isNaN(d.getTime())) return typeof val === 'string' ? val : ''
    try {
        return d.toLocaleTimeString()
    } catch {
        return String(val)
    }
}

function dateValue(value, locale) {
    if (!value) return '—'
    const d = new Date(value)
    if (isNaN(d.getTime())) return typeof value === 'string' ? value : '—'
    try {
        return new Intl.DateTimeFormat(locale === 'km' ? 'km-KH' : 'en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        }).format(d)
    } catch {
        return String(value)
    }
}

function displayName(user) {
    return user.name || [user.givenName, user.familyName].filter(Boolean).join(' ') || user.username
}

function DetailField({label, children}) {
    return (
        <div className="min-w-0">
            <dt className="text-xs text-slate-500 dark:text-slate-400">{label}</dt>
            <dd className="mt-1 break-words text-sm font-medium text-slate-800 dark:text-slate-100">{children || '—'}</dd>
        </div>
    )
}

function TabButton({id, selected, onSelect, children}) {
    return (
        <button
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onSelect(id)}
            className={`border-b-2 px-3 py-3 text-xs sm:text-sm font-medium transition cursor-pointer whitespace-nowrap ${
                selected
                    ? 'border-violet-700 font-bold text-violet-800 dark:text-violet-300'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
        >
            {children}
        </button>
    )
}

// Assign Role Dialog
function AssignRoleDialog({open, onClose, onAssigned, token, userId, t, locale}) {
    const [roles, setRoles] = useState([])
    const [selectedRole, setSelectedRole] = useState('')
    const [reason, setReason] = useState('')
    const [expiresAt, setExpiresAt] = useState('')
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (open) {
            adminApi.listRoles(token, {page: 0, size: 100}).then((data) => {
                setRoles(data.content || [])
                if (data.content?.length) setSelectedRole(data.content[0].uuid)
            }).catch(() => setError('Failed to load roles'))
        }
    }, [open, token])

    if (!open) return null

    async function submit(e) {
        e.preventDefault()
        if (!selectedRole) return
        setBusy(true)
        setError('')
        try {
            await adminApi.assignRolesToUser(
                token,
                userId,
                [selectedRole],
                expiresAt ? new Date(expiresAt).toISOString() : null,
                reason || 'Administrative role assignment'
            )
            onAssigned()
            onClose()
        } catch (err) {
            setError(err.message || 'Failed to assign role')
        } finally {
            setBusy(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95">
                <header className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <ShieldCheck className="size-4 text-violet-600" />
                        {locale === 'km' ? 'កំណត់តួនាទីឱ្យអ្នកប្រើ' : 'Assign Role to User'}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
                </header>

                {error && (
                    <div className="mt-3 rounded-lg bg-red-50 p-2 text-xs text-red-700 dark:bg-red-950 dark:text-red-300">
                        {error}
                    </div>
                )}

                <form onSubmit={submit} className="mt-4 grid gap-3">
                    <label className="grid gap-1 text-xs font-medium text-slate-700 dark:text-slate-300">
                        <span>{locale === 'km' ? 'ជ្រើសរើសតួនាទី:' : 'Select Role:'}</span>
                        <select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs dark:border-slate-700 dark:bg-slate-950"
                            required
                        >
                            {roles.map((r) => (
                                <option key={r.uuid} value={r.uuid}>
                                    {r.name} - {r.description || 'No description'}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="grid gap-1 text-xs font-medium text-slate-700 dark:text-slate-300">
                        <span>{locale === 'km' ? 'កាលបរិច្ឆេទផុតកំណត់ (មិនបង្ខំ):' : 'Expiration Date (optional):'}</span>
                        <input
                            type="datetime-local"
                            value={expiresAt}
                            onChange={(e) => setExpiresAt(e.target.value)}
                            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs dark:border-slate-700 dark:bg-slate-950"
                        />
                    </label>

                    <label className="grid gap-1 text-xs font-medium text-slate-700 dark:text-slate-300">
                        <span>{locale === 'km' ? 'មូលហេតុ:' : 'Reason / Note:'}</span>
                        <input
                            type="text"
                            placeholder="e.g. Promoted to administrator team"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs dark:border-slate-700 dark:bg-slate-950"
                        />
                    </label>

                    <div className="mt-3 flex justify-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                        <Button type="button" variant="outline" size="sm" onClick={onClose}>
                            {t.cancel || 'Cancel'}
                        </Button>
                        <Button type="submit" variant="default" size="sm" disabled={busy} className="bg-violet-700 text-white">
                            {busy ? '…' : (locale === 'km' ? 'កំណត់តួនាទី' : 'Assign Role')}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// Grant Direct Permission Dialog
function GrantPermissionDialog({open, onClose, onGranted, token, userId, t, locale}) {
    const [permissions, setPermissions] = useState([])
    const [selectedPerm, setSelectedPerm] = useState('')
    const [effect, setEffect] = useState('GRANT')
    const [reason, setReason] = useState('')
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (open) {
            setError('')
            adminApi.listPermissions(token, {page: 0, size: 100}).then((data) => {
                const list = data.content || []
                setPermissions(list)
                if (list.length) setSelectedPerm(list[0].uuid)
            }).catch(() => setError('Failed to load permissions'))
        }
    }, [open, token])

    if (!open) return null

    async function submit(e) {
        e.preventDefault()
        if (!selectedPerm) return
        setBusy(true)
        setError('')
        try {
            await adminApi.grantPermissionsToUser(
                token,
                userId,
                [selectedPerm],
                effect,
                null,
                reason || 'Direct user permission grant'
            )
            onGranted()
            onClose()
        } catch (err) {
            setError(err.message || 'Failed to grant permission')
        } finally {
            setBusy(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95">
                <header className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <KeyRound className="size-4 text-violet-600" />
                        {locale === 'km' ? 'ផ្តល់សិទ្ធិផ្ទាល់ដល់អ្នកប្រើ' : 'Grant Direct Permission'}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
                </header>

                {error && (
                    <div className="mt-3 rounded-lg bg-red-50 p-2 text-xs text-red-700 dark:bg-red-950 dark:text-red-300">
                        {error}
                    </div>
                )}

                <form onSubmit={submit} className="mt-4 grid gap-3">
                    <label className="grid gap-1 text-xs font-medium text-slate-700 dark:text-slate-300">
                        <span>{locale === 'km' ? 'ជ្រើសរើសសិទ្ធិ:' : 'Select Permission:'}</span>
                        <select
                            value={selectedPerm}
                            onChange={(e) => setSelectedPerm(e.target.value)}
                            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs dark:border-slate-700 dark:bg-slate-950"
                            required
                        >
                            {permissions.map((p) => (
                                <option key={p.uuid} value={p.uuid}>
                                    {p.name} ({p.resource}:{p.action})
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="grid gap-1 text-xs font-medium text-slate-700 dark:text-slate-300">
                        <span>{locale === 'km' ? 'ប្រសិទ្ធភាពសិទ្ធិ (Effect):' : 'Permission Effect:'}</span>
                        <select
                            value={effect}
                            onChange={(e) => setEffect(e.target.value)}
                            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs dark:border-slate-700 dark:bg-slate-950"
                        >
                            <option value="GRANT">GRANT (អនុញ្ញាត)</option>
                            <option value="DENY">DENY (បដិសេធ)</option>
                        </select>
                    </label>

                    <label className="grid gap-1 text-xs font-medium text-slate-700 dark:text-slate-300">
                        <span>{locale === 'km' ? 'មូលហេតុ:' : 'Reason / Justification:'}</span>
                        <input
                            type="text"
                            placeholder="e.g. Temporary support escalation"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs dark:border-slate-700 dark:bg-slate-950"
                        />
                    </label>

                    <div className="mt-3 flex justify-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                        <Button type="button" variant="outline" size="sm" onClick={onClose}>
                            {t.cancel || 'Cancel'}
                        </Button>
                        <Button type="submit" variant="default" size="sm" disabled={busy} className="bg-violet-700 text-white">
                            {busy ? '…' : (locale === 'km' ? 'ផ្តល់សិទ្ធិ' : 'Grant Permission')}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// Admin Reset Password Dialog
function AdminResetPasswordDialog({open, onClose, onReset, token, user, t, locale}) {
    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState('')

    if (!open) return null

    function generateRandomPassword() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*'
        let pwd = ''
        for (let i = 0; i < 12; i++) {
            pwd += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        setPassword(pwd)
        setConfirm(pwd)
    }

    async function submit(e) {
        e.preventDefault()
        if (password !== confirm) {
            setError(t.mismatch || 'Passwords do not match')
            return
        }
        setBusy(true)
        setError('')
        try {
            await adminApi.resetUserPassword(token, user.uuid || user.id, password, confirm)
            onReset()
            onClose()
        } catch (err) {
            setError(err.message || 'Failed to reset password')
        } finally {
            setBusy(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95">
                <header className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Lock className="size-4 text-violet-600" />
                        {locale === 'km' ? 'កំណត់ពាក្យសម្ងាត់អ្នកប្រើឡើងវិញ' : 'Reset User Password'}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
                </header>

                <p className="mt-2 text-xs text-slate-500">
                    {locale === 'km'
                        ? `កំណត់ពាក្យសម្ងាត់ថ្មីសម្រាប់ ${displayName(user)} (@${user.username})`
                        : `Set a new temporary password for ${displayName(user)} (@${user.username})`}
                </p>

                {error && (
                    <div className="mt-3 rounded-lg bg-red-50 p-2 text-xs text-red-700 dark:bg-red-950 dark:text-red-300">
                        {error}
                    </div>
                )}

                <form onSubmit={submit} className="mt-4 grid gap-3">
                    <label className="grid gap-1 text-xs font-medium text-slate-700 dark:text-slate-300">
                        <div className="flex items-center justify-between">
                            <span>{t.newPassword || 'New Password'}</span>
                            <button
                                type="button"
                                onClick={generateRandomPassword}
                                className="text-[11px] font-semibold text-violet-700 hover:underline"
                            >
                                {locale === 'km' ? 'បង្កើតស្វ័យប្រវត្តិ' : 'Generate random'}
                            </button>
                        </div>
                        <Input
                            type="text"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Min 8 characters"
                            required
                            className="text-xs"
                        />
                    </label>

                    <label className="grid gap-1 text-xs font-medium text-slate-700 dark:text-slate-300">
                        <span>{t.confirmPassword || 'Confirm Password'}</span>
                        <Input
                            type="text"
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            required
                            className="text-xs"
                        />
                    </label>

                    <div className="mt-3 flex justify-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                        <Button type="button" variant="outline" size="sm" onClick={onClose}>
                            {t.cancel || 'Cancel'}
                        </Button>
                        <Button type="submit" variant="default" size="sm" disabled={busy} className="bg-violet-700 text-white">
                            {busy ? '…' : (locale === 'km' ? 'កំណត់ពាក្យសម្ងាត់' : 'Reset Password')}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// Edit User Profile Dialog
function EditUserDialog({open, onClose, onUpdated, token, user, t, locale}) {
    const [form, setForm] = useState({
        givenName: user.givenName || '',
        familyName: user.familyName || '',
        phoneNumber: user.phoneNumber || '',
        pictureUrl: user.pictureUrl || '',
        locale: user.locale || 'en',
    })
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState('')

    if (!open) return null

    async function submit(e) {
        e.preventDefault()
        setBusy(true)
        setError('')
        try {
            await adminApi.updateUser(token, user.uuid || user.id, form)
            onUpdated()
            onClose()
        } catch (err) {
            setError(err.message || 'Failed to update user profile')
        } finally {
            setBusy(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95">
                <header className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Edit className="size-4 text-violet-600" />
                        {locale === 'km' ? 'កែប្រែព័ត៌មានអ្នកប្រើ' : 'Edit User Profile'}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
                </header>

                {error && (
                    <div className="mt-3 rounded-lg bg-red-50 p-2 text-xs text-red-700 dark:bg-red-950 dark:text-red-300">
                        {error}
                    </div>
                )}

                <form onSubmit={submit} className="mt-4 grid gap-3">
                    <label className="grid gap-1 text-xs font-medium text-slate-700 dark:text-slate-300">
                        <span>{t.firstName || 'First Name'}</span>
                        <Input
                            value={form.givenName}
                            onChange={(e) => setForm({...form, givenName: e.target.value})}
                            required
                            className="text-xs"
                        />
                    </label>

                    <label className="grid gap-1 text-xs font-medium text-slate-700 dark:text-slate-300">
                        <span>{t.lastName || 'Last Name'}</span>
                        <Input
                            value={form.familyName}
                            onChange={(e) => setForm({...form, familyName: e.target.value})}
                            required
                            className="text-xs"
                        />
                    </label>

                    <label className="grid gap-1 text-xs font-medium text-slate-700 dark:text-slate-300">
                        <span>{t.phone || 'Phone Number'}</span>
                        <Input
                            value={form.phoneNumber}
                            onChange={(e) => setForm({...form, phoneNumber: e.target.value})}
                            placeholder="+855 12 345 678"
                            className="text-xs"
                        />
                    </label>

                    <label className="grid gap-1 text-xs font-medium text-slate-700 dark:text-slate-300">
                        <span>Profile Picture URL</span>
                        <Input
                            value={form.pictureUrl}
                            onChange={(e) => setForm({...form, pictureUrl: e.target.value})}
                            placeholder="https://example.com/avatar.jpg"
                            className="text-xs"
                        />
                    </label>

                    <label className="grid gap-1 text-xs font-medium text-slate-700 dark:text-slate-300">
                        <span>{t.language || 'Language'}</span>
                        <select
                            value={form.locale}
                            onChange={(e) => setForm({...form, locale: e.target.value})}
                            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs dark:border-slate-700 dark:bg-slate-950"
                        >
                            <option value="en">{t.english || 'English'}</option>
                            <option value="km">{t.khmer || 'Khmer'}</option>
                        </select>
                    </label>

                    <div className="mt-3 flex justify-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                        <Button type="button" variant="outline" size="sm" onClick={onClose}>
                            {t.cancel || 'Cancel'}
                        </Button>
                        <Button type="submit" variant="default" size="sm" disabled={busy} className="bg-violet-700 text-white">
                            {busy ? '…' : (t.save || 'Save Changes')}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default function AdminUserDetailPage({token, userId, onBack, t, locale}) {
    const [detail, setDetail] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [notice, setNotice] = useState('')
    const [tab, setTab] = useState('profile')
    const [actioning, setActioning] = useState(false)

    // Dialog states
    const [assignRoleOpen, setAssignRoleOpen] = useState(false)
    const [grantPermOpen, setGrantPermOpen] = useState(false)
    const [resetPwdOpen, setResetPwdOpen] = useState(false)
    const [editUserOpen, setEditUserOpen] = useState(false)

    // User sessions state
    const [userSessions, setUserSessions] = useState([])

    const loadDetail = useCallback(async () => {
        setLoading(true)
        setError('')
        try {
            const data = await adminApi.getUserDetail(token, userId)
            setDetail(data)
            // Load real sessions for this user
            try {
                const allSessions = await adminApi.listAllUserSessions()
                const sessions = (allSessions || []).filter(
                    (s) => s.username === data?.user?.username || s.userId === data?.user?.uuid
                )
                setUserSessions(sessions)
            } catch {
                setUserSessions([])
            }
        } catch (err) {
            setError(err.message || 'Failed to load user details')
        } finally {
            setLoading(false)
        }
    }, [token, userId])

    useEffect(() => {
        loadDetail()
    }, [loadDetail])

    function notify(msg) {
        setNotice(msg)
        setTimeout(() => setNotice(''), 3500)
    }

    async function handleToggleStatus() {
        if (!detail?.user) return
        setActioning(true)
        try {
            if (detail.user.enabled) {
                await adminApi.disableUser(token, userId)
                notify('User deactivated')
            } else {
                await adminApi.enableUser(token, userId)
                notify('User activated')
            }
            loadDetail()
        } catch (err) {
            setError(err.message || 'Status change failed')
        } finally {
            setActioning(false)
        }
    }

    async function handleToggleLock() {
        if (!detail?.user) return
        setActioning(true)
        try {
            if (detail.user.accountNonLocked) {
                await adminApi.lockUser(token, userId)
                notify('User locked')
            } else {
                await adminApi.unlockUser(token, userId)
                notify('User unlocked')
            }
            loadDetail()
        } catch (err) {
            setError(err.message || 'Lock toggle failed')
        } finally {
            setActioning(false)
        }
    }

    async function handleDeleteUser() {
        if (!window.confirm(`Are you sure you want to permanently delete user @${detail?.user?.username}?`)) return
        setActioning(true)
        try {
            await adminApi.deleteUser(token, userId)
            onBack()
        } catch (err) {
            setError(err.message || 'Failed to delete user')
            setActioning(false)
        }
    }

    async function handleRevokeRole(roleUuid, roleName) {
        if (!window.confirm(`Revoke role "${roleName}" from this user?`)) return
        try {
            await adminApi.revokeRoleFromUser(token, userId, roleUuid)
            notify(`Revoked role ${roleName}`)
            loadDetail()
        } catch (err) {
            setError(err.message || 'Failed to revoke role')
        }
    }

    async function handleRevokePermission(permUuid, permName) {
        if (!window.confirm(`Revoke permission "${permName}" from this user?`)) return
        try {
            await adminApi.revokePermissionFromUser(token, userId, permUuid)
            notify(`Revoked permission ${permName}`)
            loadDetail()
        } catch (err) {
            setError(err.message || 'Failed to revoke permission')
        }
    }

    async function handleTerminateSession(sessionId) {
        try {
            await adminApi.terminateUserSession(sessionId)
            setUserSessions(userSessions.filter((s) => s.id !== sessionId))
            notify('User session terminated')
        } catch (_err) {
            setError('Failed to terminate session')
        }
    }

    if (loading && !detail) {
        return (
            <div className="flex h-64 items-center justify-center">
                <LoaderCircle className="size-6 animate-spin text-violet-700" />
            </div>
        )
    }

    if (!detail?.user) {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
                <CircleAlert className="mx-auto size-8 text-red-500 mb-2" />
                <p className="font-semibold">{error || 'User not found.'}</p>
                <Button variant="outline" size="sm" onClick={onBack} className="mt-4">
                    {t.adminBackToUsers || 'Back to users'}
                </Button>
            </div>
        )
    }

    const {user, authorities, identities = []} = detail
    const authority = authorities || {}
    const roleAssignments = authority.assignedRoles || []
    const directPermissions = authority.directPermissions || []
    const effectivePermissions = Array.from(authority.effectivePermissions || [])
    const isActive = user.enabled && user.accountNonLocked

    return (
        <div className="grid gap-6">
            {/* Top Navigation & Actions */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <Button variant="ghost" size="sm" onClick={onBack} className="-ml-2 mb-2 text-slate-500">
                        <ArrowLeft className="size-4 mr-1.5" />
                        {t.adminBackToUsers || 'Back to users'}
                    </Button>
                    <div className="flex flex-wrap items-center gap-3">
                        <Avatar user={user} className="size-14 text-base ring-2 ring-violet-200" />
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                                    {displayName(user)}
                                </h2>
                                <Badge variant={isActive ? 'success' : 'secondary'}>
                                    <span className={`size-1.5 rounded-full mr-1 ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                    {user.enabled ? (t.active || 'Active') : (t.inactive || 'Disabled')}
                                </Badge>
                                {!user.accountNonLocked && (
                                    <Badge variant="destructive">
                                        <Lock className="size-3 mr-1" />
                                        Locked
                                    </Badge>
                                )}
                            </div>
                            <p className="mt-0.5 text-xs text-slate-500">
                                @{user.username} <span className="px-1">·</span> {user.email}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Administrative Controls */}
                <div className="flex flex-wrap items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setEditUserOpen(true)} disabled={actioning}>
                        <Edit className="size-3.5 mr-1" /> {t.edit || 'Edit'}
                    </Button>
                    <Button
                        variant={user.enabled ? 'outline' : 'default'}
                        size="sm"
                        onClick={handleToggleStatus}
                        disabled={actioning}
                    >
                        <Power className="size-3.5 mr-1" /> {user.enabled ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                        variant={user.accountNonLocked ? 'outline' : 'default'}
                        size="sm"
                        onClick={handleToggleLock}
                        disabled={actioning}
                    >
                        {user.accountNonLocked ? <Lock className="size-3.5 mr-1" /> : <Unlock className="size-3.5 mr-1" />}
                        {user.accountNonLocked ? 'Lock' : 'Unlock'}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setResetPwdOpen(true)} disabled={actioning}>
                        <KeyRound className="size-3.5 mr-1" /> Reset Pwd
                    </Button>
                    <Button variant="destructive" size="sm" onClick={handleDeleteUser} disabled={actioning}>
                        <Trash2 className="size-3.5 mr-1" /> Delete
                    </Button>
                </div>
            </div>

            {notice && (
                <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
                    <Check className="size-4" />
                    <span>{notice}</span>
                </div>
            )}

            {error && (
                <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800 dark:border-red-950 dark:bg-red-950/40 dark:text-red-200">
                    <CircleAlert className="size-4" />
                    <span>{error}</span>
                </div>
            )}

            {/* Quick Metrics */}
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
                <Card className="p-3.5 shadow-none">
                    <p className="text-[11px] text-slate-500">Created</p>
                    <p className="text-sm font-bold text-slate-800 dark:text-white mt-0.5">{dateValue(user.createdAt, locale)}</p>
                </Card>
                <Card className="p-3.5 shadow-none">
                    <p className="text-[11px] text-slate-500">Assigned Roles</p>
                    <p className="text-sm font-bold text-slate-800 dark:text-white mt-0.5">{roleAssignments.length} roles</p>
                </Card>
                <Card className="p-3.5 shadow-none">
                    <p className="text-[11px] text-slate-500">Effective Permissions</p>
                    <p className="text-sm font-bold text-slate-800 dark:text-white mt-0.5">{effectivePermissions.length} perms</p>
                </Card>
                <Card className="p-3.5 shadow-none">
                    <p className="text-[11px] text-slate-500">Linked Accounts</p>
                    <p className="text-sm font-bold text-slate-800 dark:text-white mt-0.5">{identities.length} providers</p>
                </Card>
            </div>

            {/* Tab Navigation */}
            <div>
                <div role="tablist" className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-800">
                    <TabButton id="profile" selected={tab === 'profile'} onSelect={setTab}>
                        {t.adminProfileTab || 'Profile'}
                    </TabButton>
                    <TabButton id="roles" selected={tab === 'roles'} onSelect={setTab}>
                        {t.adminRolesPermissionsTab || 'Roles & Permissions'}
                    </TabButton>
                    <TabButton id="security" selected={tab === 'security'} onSelect={setTab}>
                        {t.adminSecurityTab || 'Security'}
                    </TabButton>
                    <TabButton id="sessions" selected={tab === 'sessions'} onSelect={setTab}>
                        {locale === 'km' ? 'សម័យសកម្ម' : 'Sessions'} ({userSessions.length})
                    </TabButton>
                    <TabButton id="linked" selected={tab === 'linked'} onSelect={setTab}>
                        {t.adminLinkedAccountsTab || 'Linked Accounts'} ({identities.length})
                    </TabButton>
                </div>

                {/* Tab 1: Profile */}
                {tab === 'profile' && (
                    <Card className="mt-4 p-5">
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <DetailField label={t.firstName || 'First name'}>{user.givenName}</DetailField>
                            <DetailField label={t.lastName || 'Last name'}>{user.familyName}</DetailField>
                            <DetailField label={t.username || 'Username'}>@{user.username}</DetailField>
                            <DetailField label={t.email || 'Email'}>{user.email}</DetailField>
                            <DetailField label={t.phone || 'Phone number'}>{user.phoneNumber}</DetailField>
                            <DetailField label={t.language || 'Language'}>{user.locale === 'km' ? 'Khmer' : 'English'}</DetailField>
                            <DetailField label={t.adminCreatedAt || 'Created at'}>{dateValue(user.createdAt, locale)}</DetailField>
                            <DetailField label={t.adminUpdatedAt || 'Last updated'}>{dateValue(user.updatedAt, locale)}</DetailField>
                        </div>
                    </Card>
                )}

                {/* Tab 2: Roles & Permissions */}
                {tab === 'roles' && (
                    <div className="mt-4 grid gap-6">
                        {/* Assigned Roles Section */}
                        <Card className="p-5">
                            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3 dark:border-slate-800">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                        <ShieldCheck className="size-4 text-violet-600" />
                                        {t.adminAssignedRoles || 'Assigned Roles'}
                                    </h3>
                                    <p className="text-xs text-slate-400">Roles granted to this user with expiry and reason</p>
                                </div>
                                <Button
                                    size="sm"
                                    onClick={() => setAssignRoleOpen(true)}
                                    className="bg-violet-700 text-white text-xs"
                                >
                                    <PlusCircle className="size-3.5 mr-1" />
                                    Assign Role
                                </Button>
                            </div>

                            {roleAssignments.length > 0 ? (
                                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {roleAssignments.map((assignment) => (
                                        <div key={assignment.roleUuid || assignment.roleName} className="flex items-center justify-between py-3">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                                                        {assignment.roleName}
                                                    </span>
                                                    {assignment.expiresAt && (
                                                        <Badge variant="outline" className="text-[10px]">
                                                            Expires: {dateValue(assignment.expiresAt, locale)}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-[11px] text-slate-400 mt-0.5">
                                                    {assignment.reason || 'Assigned by administrator'} · Assigned {dateValue(assignment.assignedAt, locale)}
                                                </p>
                                            </div>
                                            <Button
                                                variant="destructive"
                                                size="xs"
                                                onClick={() => handleRevokeRole(assignment.roleUuid, assignment.roleName)}
                                            >
                                                Revoke
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-slate-400 py-3">{t.adminNoRoles || 'No roles assigned.'}</p>
                            )}
                        </Card>

                        {/* Direct Permissions Section */}
                        <Card className="p-5">
                            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3 dark:border-slate-800">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                        <KeyRound className="size-4 text-violet-600" />
                                        Direct Permission Grants
                                    </h3>
                                    <p className="text-xs text-slate-400">Permissions assigned directly to this specific user</p>
                                </div>
                                <Button
                                    size="sm"
                                    onClick={() => setGrantPermOpen(true)}
                                    className="bg-violet-700 text-white text-xs"
                                >
                                    <PlusCircle className="size-3.5 mr-1" />
                                    Grant Permission
                                </Button>
                            </div>

                            {directPermissions.length > 0 ? (
                                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {directPermissions.map((perm) => (
                                        <div key={perm.permissionUuid || perm.permissionName} className="flex items-center justify-between py-3">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold font-mono text-slate-900 dark:text-white">
                                                        {perm.permissionName}
                                                    </span>
                                                    <Badge variant={perm.effect === 'GRANT' ? 'success' : 'destructive'} className="text-[9px]">
                                                        {perm.effect}
                                                    </Badge>
                                                </div>
                                                <p className="text-[11px] text-slate-400 mt-0.5">
                                                    {perm.reason || 'Direct grant'} · {dateValue(perm.assignedAt, locale)}
                                                </p>
                                            </div>
                                            <Button
                                                variant="destructive"
                                                size="xs"
                                                onClick={() => handleRevokePermission(perm.permissionUuid, perm.permissionName)}
                                            >
                                                Revoke
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-slate-400 py-3">No direct user permissions granted.</p>
                            )}
                        </Card>

                        {/* Effective Permissions Cloud */}
                        <Card className="p-5">
                            <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-1">
                                {t.adminEffectivePermissions || 'Effective Permissions'} ({effectivePermissions.length})
                            </h3>
                            <p className="text-xs text-slate-400 mb-3">
                                {t.adminEffectivePermissionsHint || 'All active permissions resolved through roles and direct assignments.'}
                            </p>
                            <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
                                {effectivePermissions.map((p) => (
                                    <span
                                        key={p}
                                        className="rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-mono text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                                    >
                                        {p}
                                    </span>
                                ))}
                            </div>
                        </Card>
                    </div>
                )}

                {/* Tab 3: Security */}
                {tab === 'security' && (
                    <Card className="mt-4 p-5">
                        <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4">
                            {t.adminSecurityDescription || 'Account Controls & Security Status'}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="rounded-xl border border-slate-100 p-4 dark:border-slate-800">
                                <p className="text-xs text-slate-400">Account Status</p>
                                <p className="text-sm font-bold mt-1 text-slate-800 dark:text-white">
                                    {user.enabled ? 'Enabled (Can sign in)' : 'Disabled (Blocked)'}
                                </p>
                                <Button size="xs" variant="outline" onClick={handleToggleStatus} className="mt-3">
                                    {user.enabled ? 'Deactivate Account' : 'Activate Account'}
                                </Button>
                            </div>

                            <div className="rounded-xl border border-slate-100 p-4 dark:border-slate-800">
                                <p className="text-xs text-slate-400">Lock Status</p>
                                <p className="text-sm font-bold mt-1 text-slate-800 dark:text-white">
                                    {user.accountNonLocked ? 'Unlocked (Normal)' : 'Locked (Security Block)'}
                                </p>
                                <Button size="xs" variant="outline" onClick={handleToggleLock} className="mt-3">
                                    {user.accountNonLocked ? 'Lock Account' : 'Unlock Account'}
                                </Button>
                            </div>

                            <div className="rounded-xl border border-slate-100 p-4 dark:border-slate-800">
                                <p className="text-xs text-slate-400">Credentials &amp; Password</p>
                                <p className="text-sm font-bold mt-1 text-slate-800 dark:text-white">
                                    Password Protected
                                </p>
                                <Button size="xs" variant="outline" onClick={() => setResetPwdOpen(true)} className="mt-3">
                                    Reset Password
                                </Button>
                            </div>

                            <div className="rounded-xl border border-slate-100 p-4 dark:border-slate-800">
                                <p className="text-xs text-slate-400">Email Verification</p>
                                <p className="text-sm font-bold mt-1 text-slate-800 dark:text-white">
                                    {user.emailVerified ? 'Verified' : 'Unverified'}
                                </p>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Tab 4: User Sessions */}
                {tab === 'sessions' && (
                    <Card className="mt-4 p-5">
                        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3 dark:border-slate-800">
                            <div>
                                <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                    <Laptop className="size-4 text-violet-600" />
                                    User Active Sessions
                                </h3>
                                <p className="text-xs text-slate-400">Active login sessions for this specific account</p>
                            </div>
                        </div>

                        {userSessions.length > 0 ? (
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {userSessions.map((session) => (
                                    <div key={session.id} className="flex items-center justify-between py-3">
                                        <div className="flex items-center gap-3">
                                            <span className="grid size-9 place-items-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600">
                                                <Laptop className="size-4" />
                                            </span>
                                            <div>
                                                <p className="text-xs font-bold text-slate-800 dark:text-white">
                                                    {session.deviceName} ({session.browser})
                                                </p>
                                                <p className="text-[11px] text-slate-400">
                                                    {session.ipAddress} · {session.location} · Active {safeFormatTime(session.lastActiveAt || session.lastActive)}
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="destructive"
                                            size="xs"
                                            onClick={() => handleTerminateSession(session.id)}
                                        >
                                            Terminate
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-slate-400 py-4 text-center">No active sessions for this user.</p>
                        )}
                    </Card>
                )}

                {/* Tab 5: Linked Accounts */}
                {tab === 'linked' && (
                    <Card className="mt-4 p-5">
                        <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-3">
                            {t.adminLinkedAccounts || 'External Linked Identities'}
                        </h3>
                        {identities.length > 0 ? (
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {identities.map((id) => (
                                    <div key={id.uuid || id.provider} className="flex items-center justify-between py-3">
                                        <div className="flex items-center gap-3">
                                            <span className="grid size-9 place-items-center rounded-lg bg-violet-50 font-bold text-violet-700">
                                                {id.provider?.[0]?.toUpperCase()}
                                            </span>
                                            <div>
                                                <p className="text-xs font-bold text-slate-800 dark:text-white capitalize">
                                                    {id.provider}
                                                </p>
                                                <p className="text-[11px] text-slate-400">
                                                    {id.email || id.displayName || id.providerSubject} · Linked {dateValue(id.linkedAt, locale)}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className="text-[10px]">Connected</Badge>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-slate-400 py-3">{t.adminNoLinkedAccounts || 'No external accounts are linked.'}</p>
                        )}
                    </Card>
                )}
            </div>

            {/* Dialogs */}
            <AssignRoleDialog
                open={assignRoleOpen}
                onClose={() => setAssignRoleOpen(false)}
                onAssigned={loadDetail}
                token={token}
                userId={userId}
                t={t}
                locale={locale}
            />

            <GrantPermissionDialog
                open={grantPermOpen}
                onClose={() => setGrantPermOpen(false)}
                onGranted={loadDetail}
                token={token}
                userId={userId}
                t={t}
                locale={locale}
            />

            <AdminResetPasswordDialog
                open={resetPwdOpen}
                onClose={() => setResetPwdOpen(false)}
                onReset={() => notify('Password reset successfully')}
                token={token}
                user={user}
                t={t}
                locale={locale}
            />

            <EditUserDialog
                open={editUserOpen}
                onClose={() => setEditUserOpen(false)}
                onUpdated={loadDetail}
                token={token}
                user={user}
                t={t}
                locale={locale}
            />
        </div>
    )
}
