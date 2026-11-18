import {useEffect, useState} from 'react'
import {
    ShieldCheck,
    ShieldAlert,
    Lock,
    Unlock,
    KeyRound,
    RefreshCw,
    Search,
    CheckCircle2,
    AlertTriangle,
    Check,
    AlertCircle,
    UserX
} from 'lucide-react'
import {adminApi} from '../api/adminApi'
import {adminResetPasswordSchema, validateForm} from '../../../utils/validation'
import {Badge} from '../../../components/ui/badge'
import {Button} from '../../../components/ui/button'
import {Card} from '../../../components/ui/card'
import {Input} from '../../../components/ui/input'
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '../../../components/ui/table'

export default function AdminSecurityManagementPage({token, locale, t, onSelectUser}) {
    const [users, setUsers] = useState([])
    const [deactivationRequests, setDeactivationRequests] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [resetModalUser, setResetModalUser] = useState(null)
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [resetError, setResetError] = useState('')
    const [notice, setNotice] = useState('')
    const [actioningId, setActioningId] = useState(null)

    async function loadData() {
        setLoading(true)
        try {
            const [usersData, requestsData] = await Promise.all([
                adminApi.listUsers(token, {page: 0, size: 100}),
                adminApi.listDeactivationRequests().catch(() => [])
            ])
            setUsers(usersData.content || [])
            setDeactivationRequests(requestsData || [])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [])

    function notify(msg) {
        setNotice(msg)
        setTimeout(() => setNotice(''), 3500)
    }

    async function handleApproveDeactivation(req) {
        setActioningId(req.id)
        try {
            await adminApi.approveDeactivationRequest(req.id)
            notify(locale === 'km' ? `បានអនុម័តបិទគណនី @${req.username}` : `Approved deactivation for @${req.username}`)
            loadData()
        } catch {
            alert('Failed to approve deactivation request')
        } finally {
            setActioningId(null)
        }
    }

    async function handleRejectDeactivation(req) {
        setActioningId(req.id)
        try {
            await adminApi.rejectDeactivationRequest(req.id)
            notify(locale === 'km' ? `បានបដិសេធសំណើបិទគណនី @${req.username}` : `Rejected deactivation request for @${req.username}`)
            loadData()
        } catch {
            alert('Failed to reject deactivation request')
        } finally {
            setActioningId(null)
        }
    }

    async function handleUnlock(user) {
        setActioningId(user.uuid)
        try {
            await adminApi.unlockUser(token, user.uuid)
            notify(`Account @${user.username} unlocked successfully`)
            loadData()
        } catch {
            alert('Failed to unlock user')
        } finally {
            setActioningId(null)
        }
    }

    async function handleLock(user) {
        setActioningId(user.uuid)
        try {
            await adminApi.lockUser(token, user.uuid)
            notify(`Account @${user.username} locked`)
            loadData()
        } catch {
            alert('Failed to lock user')
        } finally {
            setActioningId(null)
        }
    }

    function generateRandomPassword() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*'
        let pwd = ''
        for (let i = 0; i < 14; i++) pwd += chars.charAt(Math.floor(Math.random() * chars.length))
        setNewPassword(pwd)
        setConfirmPassword(pwd)
    }

    async function handleExecuteReset(e) {
        e.preventDefault()
        setResetError('')
        const validation = validateForm(adminResetPasswordSchema, {
            password: newPassword,
            confirmPassword: confirmPassword,
        })
        if (!validation.success) {
            setResetError(validation.firstErrorMessage)
            return
        }
        try {
            await adminApi.resetUserPassword(token, resetModalUser.uuid, newPassword, confirmPassword)
            notify(`Password reset for @${resetModalUser.username}`)
            setResetModalUser(null)
            setNewPassword('')
            setConfirmPassword('')
        } catch (err) {
            setResetError(err.message || 'Password reset failed')
        }
    }

    const lockedUsers = users.filter((u) => !u.accountNonLocked)
    const activeUsers = users.filter((u) => u.enabled && u.accountNonLocked)

    const filtered = users.filter(
        (u) =>
            u.username?.toLowerCase().includes(search.toLowerCase()) ||
            u.email?.toLowerCase().includes(search.toLowerCase()) ||
            (u.name && u.name.toLowerCase().includes(search.toLowerCase()))
    )

    return (
        <div className="grid gap-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-lg font-medium text-slate-900 dark:text-white">
                        {locale === 'km' ? 'ការគ្រប់គ្រងសុវត្ថិភាពគណនី' : 'Account Security Management'}
                    </h2>
                    <p className="text-xs text-slate-500">
                        {locale === 'km'
                            ? 'ដោះសោគណនី, កំណត់ពាក្យសម្ងាត់អ្នកប្រើប្រាស់ឡើងវិញ និងគ្រប់គ្រងវិធានការសុវត្ថិភាព'
                            : 'Administratively reset passwords, unlock compromised accounts, and enforce account protection policies.'}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
                        <RefreshCw className={`size-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
                        {t.refresh || 'Refresh'}
                    </Button>
                </div>
            </div>

            {notice && (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
                    <CheckCircle2 className="size-4 shrink-0" />
                    <span>{notice}</span>
                </div>
            )}

            {/* Security Posture Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Card className="p-4 shadow-none">
                    <div className="flex items-center gap-3">
                        <span className="grid size-9 place-items-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                            <ShieldCheck className="size-5" />
                        </span>
                        <div>
                            <p className="text-xs text-slate-500">Secure &amp; Active Accounts</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{activeUsers.length}</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-4 shadow-none border-red-200 bg-red-50/20 dark:border-red-900">
                    <div className="flex items-center gap-3">
                        <span className="grid size-9 place-items-center rounded-lg bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">
                            <Lock className="size-5" />
                        </span>
                        <div>
                            <p className="text-xs font-semibold text-red-800 dark:text-red-300">Locked Accounts</p>
                            <p className="text-2xl font-bold text-red-700 dark:text-red-400 mt-0.5">{lockedUsers.length}</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-4 shadow-none">
                    <div className="flex items-center gap-3">
                        <span className="grid size-9 place-items-center rounded-lg bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                            <KeyRound className="size-5" />
                        </span>
                        <div>
                            <p className="text-xs text-slate-500">Password Policy</p>
                            <p className="text-xs font-bold text-slate-800 dark:text-white mt-1">PBKDF2 / Argon2 Hashes</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Pending Deactivation Requests Queue */}
            {deactivationRequests.length > 0 && (
                <Card className="border-amber-300 overflow-hidden shadow-none">
                    <div className="bg-amber-50/70 p-4 border-b border-amber-200 dark:bg-amber-950/40 dark:border-amber-900 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <UserX className="size-4 text-amber-600" />
                            <h3 className="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wide">
                                {locale === 'km' ? 'សំណើសុំបិទគណនីកំពុងរង់ចាំការអនុម័ត' : 'Pending Deactivation Requests Requiring Admin Review'} ({deactivationRequests.length})
                            </h3>
                        </div>
                        <Badge variant="outline" className="border-amber-400 bg-amber-100 text-amber-800 text-[10px]">
                            {locale === 'km' ? 'រង់ចាំការសម្រេច' : 'Action Required'}
                        </Badge>
                    </div>
                    <div className="divide-y divide-amber-100 dark:divide-amber-950/50">
                        {deactivationRequests.map((req) => (
                            <div key={req.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white dark:bg-slate-900 gap-3">
                                <div>
                                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                                        @{req.username} <span className="font-normal text-slate-400">({req.email || req.name || 'User'})</span>
                                    </p>
                                    <p className="text-[11px] text-amber-900 dark:text-amber-300 mt-0.5">
                                        <span className="font-semibold">Reason:</span> {req.reason}
                                        {req.feedback && <span className="text-slate-500 italic"> — "{req.feedback}"</span>}
                                    </p>
                                    <p className="text-[10px] text-slate-400 mt-0.5">
                                        Submitted on: {req.requestedAt ? new Date(req.requestedAt).toLocaleString() : 'recently'}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        size="xs"
                                        variant="destructive"
                                        disabled={actioningId === req.id}
                                        onClick={() => handleApproveDeactivation(req)}
                                    >
                                        <UserX className="size-3 mr-1" />
                                        Approve Deactivation
                                    </Button>
                                    <Button
                                        size="xs"
                                        variant="outline"
                                        disabled={actioningId === req.id}
                                        onClick={() => handleRejectDeactivation(req)}
                                    >
                                        Reject
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Locked Accounts Queue */}
            {lockedUsers.length > 0 && (
                <Card className="border-red-200 overflow-hidden shadow-none">
                    <div className="bg-red-50/70 p-4 border-b border-red-100 dark:bg-red-950/40 dark:border-red-900 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="size-4 text-red-600" />
                            <h3 className="text-xs font-bold text-red-900 dark:text-red-200 uppercase tracking-wide">
                                Locked Accounts Requiring Attention ({lockedUsers.length})
                            </h3>
                        </div>
                    </div>
                    <div className="divide-y divide-red-100 dark:divide-red-950/50">
                        {lockedUsers.map((u) => (
                            <div key={u.uuid} className="flex items-center justify-between p-4 bg-white dark:bg-slate-900">
                                <div>
                                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                                        @{u.username} <span className="font-normal text-slate-400">({u.email})</span>
                                    </p>
                                    <p className="text-[11px] text-red-500 mt-0.5">
                                        Locked due to excessive failed attempts or admin policy
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        size="xs"
                                        variant="default"
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                        disabled={actioningId === u.uuid}
                                        onClick={() => handleUnlock(u)}
                                    >
                                        <Unlock className="size-3 mr-1" />
                                        Unlock Account
                                    </Button>
                                    <Button
                                        size="xs"
                                        variant="outline"
                                        onClick={() => setResetModalUser(u)}
                                    >
                                        Reset Password
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* All Accounts Security Controls Table */}
            <Card className="gap-0 overflow-hidden shadow-none">
                <div className="flex items-center justify-between border-b border-slate-100 p-4 dark:border-slate-800">
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-2.5 size-3.5 text-slate-400" />
                        <Input
                            placeholder="Search user to manage security…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-8 pl-8 text-xs"
                        />
                    </div>
                    <Badge variant="outline" className="text-xs">
                        {filtered.length} Users
                    </Badge>
                </div>

                <Table>
                    <TableHeader className="bg-slate-50/80 dark:bg-slate-800/50">
                        <TableRow>
                            <TableHead className="text-xs font-bold">User</TableHead>
                            <TableHead className="text-xs font-bold">Account State</TableHead>
                            <TableHead className="text-xs font-bold">Lock Status</TableHead>
                            <TableHead className="text-xs font-bold">Email Verified</TableHead>
                            <TableHead className="text-right text-xs font-bold">Security Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.map((user) => (
                            <TableRow key={user.uuid} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                                <TableCell className="text-xs font-bold">
                                    <button
                                        type="button"
                                        onClick={() => onSelectUser?.(user.uuid || user.id || user)}
                                        className="text-left hover:text-violet-700"
                                    >
                                        <span>@{user.username}</span>
                                        <span className="block text-[11px] font-normal text-slate-400">{user.email}</span>
                                    </button>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={user.enabled ? 'success' : 'secondary'} className="text-[9px]">
                                        {user.enabled ? 'Enabled' : 'Disabled'}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={user.accountNonLocked ? 'outline' : 'destructive'} className="text-[9px]">
                                        {user.accountNonLocked ? 'Unlocked' : 'Locked'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-xs text-slate-500">
                                    {user.emailVerified ? (
                                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                                            <Check className="size-3.5" /> Verified
                                        </span>
                                    ) : '—'}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                        {user.accountNonLocked ? (
                                            <Button
                                                variant="outline"
                                                size="xs"
                                                disabled={actioningId === user.uuid}
                                                onClick={() => handleLock(user)}
                                                className="text-amber-700 hover:bg-amber-50 text-[10px]"
                                            >
                                                <Lock className="size-3 mr-1" />
                                                Lock
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="outline"
                                                size="xs"
                                                disabled={actioningId === user.uuid}
                                                onClick={() => handleUnlock(user)}
                                                className="text-emerald-700 hover:bg-emerald-50 text-[10px]"
                                            >
                                                <Unlock className="size-3 mr-1" />
                                                Unlock
                                            </Button>
                                        )}
                                        <Button
                                            variant="outline"
                                            size="xs"
                                            onClick={() => setResetModalUser(user)}
                                            className="text-xs"
                                        >
                                            <KeyRound className="size-3 mr-1" />
                                            Reset Password
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>

            {/* Password Reset Modal */}
            {resetModalUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 my-auto animate-in zoom-in-95 duration-150">
                        <header className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <KeyRound className="size-4 text-violet-600" />
                                Administrative Password Reset
                            </h3>
                            <button onClick={() => { setResetModalUser(null); setResetError('') }} className="text-slate-400 hover:text-slate-600">✕</button>
                        </header>

                        <p className="mt-2 text-xs text-slate-500">
                            Reset password for user <b>@{resetModalUser.username}</b> ({resetModalUser.email}).
                        </p>

                        {resetError && (
                            <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 p-2 text-xs text-red-700 dark:bg-red-950 dark:text-red-300">
                                <AlertCircle className="size-4 shrink-0" />
                                <span>{resetError}</span>
                            </div>
                        )}

                        <form onSubmit={handleExecuteReset} className="mt-4 grid gap-3">
                            <label className="grid gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                                <div className="flex items-center justify-between">
                                    <span>New Password</span>
                                    <button
                                        type="button"
                                        onClick={generateRandomPassword}
                                        className="text-[11px] text-violet-600 hover:underline font-semibold"
                                    >
                                        Auto-generate strong
                                    </button>
                                </div>
                                <Input
                                    type="text"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Min 8 characters"
                                    required
                                    className="text-xs font-mono"
                                />
                            </label>

                            <label className="grid gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                                <span>Confirm Password</span>
                                <Input
                                    type="text"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="text-xs font-mono"
                                />
                            </label>

                            <div className="mt-3 flex justify-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                                <Button type="button" variant="outline" size="sm" onClick={() => setResetModalUser(null)}>
                                    Cancel
                                </Button>
                                <Button type="submit" variant="default" size="sm" className="bg-violet-700 text-white">
                                    Confirm Reset
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
