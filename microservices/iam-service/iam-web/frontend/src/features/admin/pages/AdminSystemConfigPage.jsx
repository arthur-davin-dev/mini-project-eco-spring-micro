import {useEffect, useState} from 'react'
import {
    Shield,
    KeyRound,
    Clock,
    Layers,
    Save,
    RotateCcw,
    CheckCircle2
} from 'lucide-react'
import {adminApi} from '../api/adminApi'
import {Button} from '../../../components/ui/button'
import {Card} from '../../../components/ui/card'
import {Input} from '../../../components/ui/input'

export default function AdminSystemConfigPage({locale, t: _t}) {
    const [config, setConfig] = useState(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [notice, setNotice] = useState('')

    async function loadConfig() {
        setLoading(true)
        try {
            const data = await adminApi.getSystemConfig()
            setConfig(data)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadConfig()
    }, [])

    function notify(msg) {
        setNotice(msg)
        setTimeout(() => setNotice(''), 3500)
    }

    async function handleSave(e) {
        e.preventDefault()
        setSaving(true)
        try {
            await adminApi.updateSystemConfig(config)
            notify(locale === 'km' ? 'បានរក្សាទុកការកំណត់ប្រព័ន្ធដោយជោគជ័យ' : 'System configuration saved successfully')
        } catch {
            alert('Failed to save configuration')
        } finally {
            setSaving(false)
        }
    }

    async function handleReset() {
        if (!window.confirm('Reset all security and token policies to factory defaults?')) return
        setSaving(true)
        try {
            const defaults = await adminApi.resetSystemConfig()
            setConfig(defaults)
            notify(locale === 'km' ? 'បានកំណត់ប្រព័ន្ធឡើងវិញតាមលំនាំដើម' : 'System policies reset to factory defaults')
        } finally {
            setSaving(false)
        }
    }

    if (loading || !config) {
        return (
            <div className="flex h-64 items-center justify-center">
                <span className="text-xs text-slate-400">Loading system configuration…</span>
            </div>
        )
    }

    return (
        <form onSubmit={handleSave} className="grid gap-6 max-w-4xl">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-lg font-medium text-slate-900 dark:text-white">
                        {locale === 'km' ? 'ការកំណត់រចនាសម្ព័ន្ធប្រព័ន្ធ' : 'System Configuration'}
                    </h2>
                    <p className="text-xs text-slate-500">
                        {locale === 'km'
                            ? 'កំណត់គោលការណ៍ផ្ទៀងផ្ទាត់, លក្ខខណ្ឌពាក្យសម្ងាត់, រយៈពេលផុតកំណត់សម័យ និងអាយុកាល Token'
                            : 'Configure global authentication policies, password criteria, session timeouts, and OAuth2 token lifetimes.'}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={handleReset} disabled={saving} className="text-xs">
                        <RotateCcw className="size-3.5 mr-1.5" />
                        Reset Defaults
                    </Button>
                    <Button type="submit" variant="default" size="sm" disabled={saving} className="bg-violet-700 hover:bg-violet-800 text-white font-semibold text-xs">
                        <Save className="size-3.5 mr-1.5" />
                        {saving ? 'Saving…' : 'Save Changes'}
                    </Button>
                </div>
            </div>

            {notice && (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
                    <CheckCircle2 className="size-4 shrink-0" />
                    <span>{notice}</span>
                </div>
            )}

            {/* Section 1: Authentication Policies */}
            <Card className="p-5">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
                    <span className="grid size-9 place-items-center rounded-lg bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                        <Shield className="size-5" />
                    </span>
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Authentication Policies</h3>
                        <p className="text-xs text-slate-500">User sign-in, MFA enforcement, and account lockout rules</p>
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={config.authPolicies.allowRegistration}
                            onChange={(e) =>
                                setConfig({
                                    ...config,
                                    authPolicies: {...config.authPolicies, allowRegistration: e.target.checked},
                                })
                            }
                            className="accent-violet-700"
                        />
                        <div>
                            <span className="font-semibold block text-slate-800 dark:text-white">Allow Public Self-Registration</span>
                            <span className="text-[11px] text-slate-400">Users can register accounts via web registration form</span>
                        </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={config.authPolicies.requireEmailVerification}
                            onChange={(e) =>
                                setConfig({
                                    ...config,
                                    authPolicies: {...config.authPolicies, requireEmailVerification: e.target.checked},
                                })
                            }
                            className="accent-violet-700"
                        />
                        <div>
                            <span className="font-semibold block text-slate-800 dark:text-white">Require Email Verification</span>
                            <span className="text-[11px] text-slate-400">Must verify email before account activation</span>
                        </div>
                    </label>

                    <div>
                        <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                            Multi-Factor Authentication (MFA) Mode
                        </label>
                        <select
                            value={config.authPolicies.mfaMode}
                            onChange={(e) =>
                                setConfig({
                                    ...config,
                                    authPolicies: {...config.authPolicies, mfaMode: e.target.value},
                                })
                            }
                            className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs dark:border-slate-700 dark:bg-slate-950"
                        >
                            <option value="DISABLED">DISABLED (Password or OAuth only)</option>
                            <option value="OPTIONAL">OPTIONAL (User choice)</option>
                            <option value="REQUIRED_ADMIN">REQUIRED_ADMIN (Mandatory for admins)</option>
                            <option value="REQUIRED_ALL">REQUIRED_ALL (Mandatory for all users)</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <label className="grid gap-1 font-semibold text-slate-700 dark:text-slate-300">
                            <span>Max Failed Attempts</span>
                            <Input
                                type="number"
                                min="3"
                                max="20"
                                value={config.authPolicies.maxFailedAttempts}
                                onChange={(e) =>
                                    setConfig({
                                        ...config,
                                        authPolicies: {...config.authPolicies, maxFailedAttempts: parseInt(e.target.value) || 5},
                                    })
                                }
                                className="text-xs"
                            />
                        </label>

                        <label className="grid gap-1 font-semibold text-slate-700 dark:text-slate-300">
                            <span>Lockout Duration (mins)</span>
                            <Input
                                type="number"
                                min="5"
                                max="1440"
                                value={config.authPolicies.lockoutDurationMinutes}
                                onChange={(e) =>
                                    setConfig({
                                        ...config,
                                        authPolicies: {...config.authPolicies, lockoutDurationMinutes: parseInt(e.target.value) || 30},
                                    })
                                }
                                className="text-xs"
                            />
                        </label>
                    </div>
                </div>
            </Card>

            {/* Section 2: Password Policies */}
            <Card className="p-5">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
                    <span className="grid size-9 place-items-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                        <KeyRound className="size-5" />
                    </span>
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Password Policies</h3>
                        <p className="text-xs text-slate-500">Complexity requirements, expiration, and reuse prevention</p>
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="grid grid-cols-2 gap-3">
                        <label className="grid gap-1 font-semibold text-slate-700 dark:text-slate-300">
                            <span>Min Length</span>
                            <Input
                                type="number"
                                min="6"
                                max="32"
                                value={config.passwordPolicies.minLength}
                                onChange={(e) =>
                                    setConfig({
                                        ...config,
                                        passwordPolicies: {...config.passwordPolicies, minLength: parseInt(e.target.value) || 8},
                                    })
                                }
                                className="text-xs"
                            />
                        </label>
                        <label className="grid gap-1 font-semibold text-slate-700 dark:text-slate-300">
                            <span>Max Length</span>
                            <Input
                                type="number"
                                min="32"
                                max="128"
                                value={config.passwordPolicies.maxLength}
                                onChange={(e) =>
                                    setConfig({
                                        ...config,
                                        passwordPolicies: {...config.passwordPolicies, maxLength: parseInt(e.target.value) || 64},
                                    })
                                }
                                className="text-xs"
                            />
                        </label>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <label className="grid gap-1 font-semibold text-slate-700 dark:text-slate-300">
                            <span>Expiration (days)</span>
                            <Input
                                type="number"
                                min="0"
                                max="365"
                                value={config.passwordPolicies.expirationDays}
                                onChange={(e) =>
                                    setConfig({
                                        ...config,
                                        passwordPolicies: {...config.passwordPolicies, expirationDays: parseInt(e.target.value) || 90},
                                    })
                                }
                                className="text-xs"
                            />
                        </label>
                        <label className="grid gap-1 font-semibold text-slate-700 dark:text-slate-300">
                            <span>History Count</span>
                            <Input
                                type="number"
                                min="0"
                                max="24"
                                value={config.passwordPolicies.historyCount}
                                onChange={(e) =>
                                    setConfig({
                                        ...config,
                                        passwordPolicies: {...config.passwordPolicies, historyCount: parseInt(e.target.value) || 5},
                                    })
                                }
                                className="text-xs"
                            />
                        </label>
                    </div>

                    <div className="sm:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                        {[
                            ['requireUppercase', 'Require Uppercase (A-Z)'],
                            ['requireLowercase', 'Require Lowercase (a-z)'],
                            ['requireDigits', 'Require Digits (0-9)'],
                            ['requireSpecialChars', 'Require Special (!@#$)'],
                        ].map(([field, label]) => (
                            <label
                                key={field}
                                className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 text-xs dark:border-slate-800 cursor-pointer"
                            >
                                <input
                                    type="checkbox"
                                    checked={config.passwordPolicies[field]}
                                    onChange={(e) =>
                                        setConfig({
                                            ...config,
                                            passwordPolicies: {...config.passwordPolicies, [field]: e.target.checked},
                                        })
                                    }
                                    className="accent-violet-700"
                                />
                                <span className="font-medium text-slate-700 dark:text-slate-300 text-[11px]">{label}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </Card>

            {/* Section 3: Session Policies & Token Lifetimes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Session Policies */}
                <Card className="p-5">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
                        <span className="grid size-9 place-items-center rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                            <Clock className="size-5" />
                        </span>
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Session Expiration</h3>
                            <p className="text-[11px] text-slate-500">Browser session lifecycle limits</p>
                        </div>
                    </div>

                    <div className="mt-4 grid gap-3 text-xs">
                        <label className="grid gap-1 font-semibold text-slate-700 dark:text-slate-300">
                            <span>Session Timeout (minutes)</span>
                            <Input
                                type="number"
                                min="15"
                                max="1440"
                                value={config.sessionPolicies.sessionTimeoutMinutes}
                                onChange={(e) =>
                                    setConfig({
                                        ...config,
                                        sessionPolicies: {...config.sessionPolicies, sessionTimeoutMinutes: parseInt(e.target.value) || 60},
                                    })
                                }
                                className="text-xs"
                            />
                        </label>

                        <label className="grid gap-1 font-semibold text-slate-700 dark:text-slate-300">
                            <span>Inactivity Timeout (minutes)</span>
                            <Input
                                type="number"
                                min="5"
                                max="120"
                                value={config.sessionPolicies.inactivityTimeoutMinutes}
                                onChange={(e) =>
                                    setConfig({
                                        ...config,
                                        sessionPolicies: {...config.sessionPolicies, inactivityTimeoutMinutes: parseInt(e.target.value) || 30},
                                    })
                                }
                                className="text-xs"
                            />
                        </label>

                        <label className="grid gap-1 font-semibold text-slate-700 dark:text-slate-300">
                            <span>Max Concurrent Sessions / User</span>
                            <Input
                                type="number"
                                min="1"
                                max="10"
                                value={config.sessionPolicies.maxConcurrentSessions}
                                onChange={(e) =>
                                    setConfig({
                                        ...config,
                                        sessionPolicies: {...config.sessionPolicies, maxConcurrentSessions: parseInt(e.target.value) || 3},
                                    })
                                }
                                className="text-xs"
                            />
                        </label>
                    </div>
                </Card>

                {/* Token Lifetimes */}
                <Card className="p-5">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
                        <span className="grid size-9 place-items-center rounded-lg bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                            <Layers className="size-5" />
                        </span>
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">OAuth2 Token Lifetimes</h3>
                            <p className="text-[11px] text-slate-500">JWT and OAuth2 token expiration periods</p>
                        </div>
                    </div>

                    <div className="mt-4 grid gap-3 text-xs">
                        <label className="grid gap-1 font-semibold text-slate-700 dark:text-slate-300">
                            <span>Access Token Lifetime (minutes)</span>
                            <Input
                                type="number"
                                min="5"
                                max="120"
                                value={config.tokenPolicies.accessTokenLifetimeMinutes}
                                onChange={(e) =>
                                    setConfig({
                                        ...config,
                                        tokenPolicies: {...config.tokenPolicies, accessTokenLifetimeMinutes: parseInt(e.target.value) || 15},
                                    })
                                }
                                className="text-xs font-mono"
                            />
                        </label>

                        <label className="grid gap-1 font-semibold text-slate-700 dark:text-slate-300">
                            <span>Refresh Token Lifetime (days)</span>
                            <Input
                                type="number"
                                min="1"
                                max="365"
                                value={config.tokenPolicies.refreshTokenLifetimeDays}
                                onChange={(e) =>
                                    setConfig({
                                        ...config,
                                        tokenPolicies: {...config.tokenPolicies, refreshTokenLifetimeDays: parseInt(e.target.value) || 30},
                                    })
                                }
                                className="text-xs font-mono"
                            />
                        </label>

                        <label className="grid gap-1 font-semibold text-slate-700 dark:text-slate-300">
                            <span>Authorization Code Lifetime (seconds)</span>
                            <Input
                                type="number"
                                min="60"
                                max="1800"
                                value={config.tokenPolicies.authorizationCodeLifetimeSeconds}
                                onChange={(e) =>
                                    setConfig({
                                        ...config,
                                        tokenPolicies: {...config.tokenPolicies, authorizationCodeLifetimeSeconds: parseInt(e.target.value) || 300},
                                    })
                                }
                                className="text-xs font-mono"
                            />
                        </label>
                    </div>
                </Card>
            </div>

            <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={handleReset} disabled={saving}>
                    Reset Defaults
                </Button>
                <Button type="submit" variant="default" size="sm" disabled={saving} className="bg-violet-700 text-white">
                    {saving ? 'Saving…' : 'Save Configuration'}
                </Button>
            </div>
        </form>
    )
}
