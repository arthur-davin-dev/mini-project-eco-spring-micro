import {useMemo, useState} from 'react'
import {
    User,
    Lock,
    KeyRound,
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    Eye,
    EyeOff,
    Loader2,
    ShieldCheck,
    Mail,
} from 'lucide-react'
import AuthShell from './AuthShell'
import Alert from './Alert'
import TextField from './TextField'

export default function ForgotPasswordPage({dark, setDark}) {
    const searchParams = useMemo(() => new URLSearchParams(typeof window !== 'undefined' ? window.location.search : ''), [])
    const langParam = searchParams.get('lang')
    const isKm = langParam === 'km' || (!langParam && typeof window !== 'undefined' && (localStorage.getItem('iam-locale') === 'km' || localStorage.getItem('iam-lang') === 'km'))

    const [step, setStep] = useState(1) // 1: request code, 2: reset password
    const [identity, setIdentity] = useState('')
    const [code, setCode] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const [emailMasked, setEmailMasked] = useState('')
    const [emailSent, setEmailSent] = useState(false)
    const [devFallbackCode, setDevFallbackCode] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [successMessage, setSuccessMessage] = useState('')

    const t = useMemo(() => {
        if (isKm) {
            return {
                title: 'ភ្លេចពាក្យសម្ងាត់',
                subtitleStep1: 'បញ្ចូលឈ្មោះអ្នកប្រើប្រាស់ ឬអាសយដ្ឋានអ៊ីមែលរបស់អ្នកដើម្បីទទួលលេខកូដកំណត់ឡើងវិញតាមរយៈអ៊ីមែល។',
                subtitleStep2: 'បញ្ចូលលេខកូដផ្ទៀងផ្ទាត់ ៦ ខ្ទង់ដែលបានផ្ញើទៅអ៊ីមែលរបស់អ្នក និងកំណត់ពាក្យសម្ងាត់ថ្មី។',
                identityLabel: 'ឈ្មោះអ្នកប្រើប្រាស់ ឬ អ៊ីមែល',
                identityPlaceholder: 'បញ្ចូលឈ្មោះអ្នកប្រើ ឬ អ៊ីមែល',
                codeLabel: 'លេខកូដផ្ទៀងផ្ទាត់ (៦ ខ្ទង់)',
                codePlaceholder: 'ឧ. 123456',
                newPasswordLabel: 'ពាក្យសម្ងាត់ថ្មី',
                newPasswordPlaceholder: 'បញ្ចូលពាក្យសម្ងាត់ថ្មី (យ៉ាងហោច ៨ តួ)',
                confirmPasswordLabel: 'បញ្ជាក់ពាក្យសម្ងាត់ថ្មី',
                confirmPasswordPlaceholder: 'បញ្ចូលពាក្យសម្ងាត់ថ្មីម្តងទៀត',
                sendCode: 'ផ្ញើលេខកូដទៅអ៊ីមែល',
                resetPassword: 'កំណត់ពាក្យសម្ងាត់ឡើងវិញ',
                backToLogin: 'ត្រឡប់ទៅចូលគណនីវិញ',
                backStep: 'ប្តូរឈ្មោះអ្នកប្រើប្រាស់',
                codeSentNotice: 'លេខកូដផ្ទៀងផ្ទាត់ ៦ ខ្ទង់ត្រូវបានផ្ញើទៅកាន់',
                checkInboxNotice: 'សូមពិនិត្យមើលប្រអប់សំបុត្រ (Inbox) ឬ Spam របស់អ្នកដើម្បីយកលេខកូដផ្ទៀងផ្ទាត់។',
                devNotice: 'ចំណាំ (SMTP មិនទាន់កំណត់នៅក្នុង .env): លេខកូដគឺ៖',
                useCode: 'ប្រើលេខកូដនេះ',
                passwordRequirement: 'ពាក្យសម្ងាត់ត្រូវមានយ៉ាងហោចណាស់ ៨ តួអក្សរ។',
                passwordsMismatch: 'ពាក្យសម្ងាត់ទាំងពីរមិនដូចគ្នាទេ។',
                codeRequired: 'សូមបញ្ចូលលេខកូដផ្ទៀងផ្ទាត់។',
                identityRequired: 'សូមបញ្ចូលឈ្មោះអ្នកប្រើប្រាស់ ឬអ៊ីមែល។',
            }
        }
        return {
            title: 'Forgot password',
            subtitleStep1: 'Enter your username or email address and we will send a 6-digit verification code to your email.',
            subtitleStep2: 'Enter the verification code sent to your email and choose a new secure password.',
            identityLabel: 'Username or email',
            identityPlaceholder: 'Enter your username or email',
            codeLabel: 'Verification code (6 digits)',
            codePlaceholder: 'e.g. 123456',
            newPasswordLabel: 'New password',
            newPasswordPlaceholder: 'Enter new password (min 8 characters)',
            confirmPasswordLabel: 'Confirm new password',
            confirmPasswordPlaceholder: 'Confirm your new password',
            sendCode: 'Send code to email',
            resetPassword: 'Reset password',
            backToLogin: 'Back to sign in',
            backStep: 'Change username / email',
            codeSentNotice: 'A 6-digit verification code was sent to',
            checkInboxNotice: 'Please check your email inbox (and spam folder) for the verification code.',
            devNotice: 'Notice (SMTP not yet configured in .env): test code is:',
            useCode: 'Use code',
            passwordRequirement: 'Password must be at least 8 characters long.',
            passwordsMismatch: 'Passwords do not match.',
            codeRequired: 'Please enter the verification code.',
            identityRequired: 'Please enter your username or email.',
        }
    }, [isKm])

    async function fetchCsrf() {
        try {
            const res = await fetch('/account/csrf', {credentials: 'same-origin'})
            if (res.ok) return await res.json()
        } catch {}
        return {parameterName: '_csrf', token: 'dev-token'}
    }

    async function handleRequestCode(e) {
        e.preventDefault()
        if (!identity.trim()) {
            setError(t.identityRequired)
            return
        }
        setError('')
        setLoading(true)

        try {
            const csrf = await fetchCsrf()
            const res = await fetch('/account/password/forgot', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    [csrf.headerName || 'X-CSRF-TOKEN']: csrf.token,
                },
                credentials: 'same-origin',
                body: JSON.stringify({identity: identity.trim()}),
            })

            const data = await res.json().catch(() => ({}))
            if (!res.ok) {
                throw new Error(data.message || 'Failed to request password reset code')
            }

            setEmailMasked(data.emailMasked || identity)
            setEmailSent(Boolean(data.emailSent))
            setDevFallbackCode(data.devFallbackCode || '')
            if (data.devFallbackCode) {
                // If local dev fallback code is returned
            }
            setStep(2)
        } catch (err) {
            setError(err.message || 'Unable to find an account with that username or email')
        } finally {
            setLoading(false)
        }
    }

    async function handleResetPassword(e) {
        e.preventDefault()
        if (!code.trim()) {
            setError(t.codeRequired)
            return
        }
        if (newPassword.length < 8) {
            setError(t.passwordRequirement)
            return
        }
        if (newPassword !== confirmPassword) {
            setError(t.passwordsMismatch)
            return
        }
        setError('')
        setLoading(true)

        try {
            const csrf = await fetchCsrf()
            const res = await fetch('/account/password/reset', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    [csrf.headerName || 'X-CSRF-TOKEN']: csrf.token,
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    identity: identity.trim(),
                    code: code.trim(),
                    newPassword,
                    confirmPassword,
                }),
            })

            const data = await res.json().catch(() => ({}))
            if (!res.ok) {
                throw new Error(data.message || 'Failed to reset password')
            }

            // Redirect back to login with success query parameter
            const redirectLang = langParam ? `&lang=${langParam}` : ''
            window.location.href = `/login?reset_success=true${redirectLang}`
        } catch (err) {
            setError(err.message || 'Password reset failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <AuthShell title={t.title} dark={dark} setDark={setDark}>
            <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
                {step === 1 ? t.subtitleStep1 : t.subtitleStep2}
            </p>

            {error && (
                <div className="my-3">
                    <Alert tone="error" role="alert">
                        {error}
                    </Alert>
                </div>
            )}

            {step === 1 && (
                <form onSubmit={handleRequestCode} className="my-5 grid gap-4.5">
                    <TextField
                        label={t.identityLabel}
                        name="identity"
                        value={identity}
                        onChange={(e) => {
                            setIdentity(e.target.value)
                            if (error) setError('')
                        }}
                        placeholder={t.identityPlaceholder}
                        autoComplete="username"
                        icon={<User className="size-4" />}
                        autoFocus
                    />

                    <button
                        type="submit"
                        disabled={loading || !identity.trim()}
                        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-violet-700 to-indigo-600 font-semibold text-white shadow-md shadow-violet-600/25 transition-all hover:from-violet-500 hover:via-violet-600 hover:to-indigo-500 hover:shadow-lg hover:shadow-violet-600/30 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="size-4 animate-spin" />
                                <span>{isKm ? 'កំពុងដំណើរការ…' : 'Processing…'}</span>
                            </>
                        ) : (
                            <>
                                <span>{t.sendCode}</span>
                                <ArrowRight className="size-4" />
                            </>
                        )}
                    </button>

                    <div className="text-center pt-2">
                        <a
                            href={`/login${langParam ? `?lang=${langParam}` : ''}`}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-violet-700 dark:text-slate-400 dark:hover:text-violet-300 transition"
                        >
                            <ArrowLeft className="size-3.5" />
                            <span>{t.backToLogin}</span>
                        </a>
                    </div>
                </form>
            )}

            {step === 2 && (
                <form onSubmit={handleResetPassword} className="my-5 grid gap-4">
                    {/* Email Delivery Security Notice */}
                    <div className="rounded-xl border border-violet-200 bg-violet-50/70 p-3.5 text-xs text-violet-900 dark:border-violet-900/60 dark:bg-violet-950/40 dark:text-violet-200">
                        <div className="flex items-start gap-2.5">
                            <Mail className="size-4.5 shrink-0 text-violet-600 dark:text-violet-400 mt-0.5" />
                            <div className="min-w-0 flex-1 leading-relaxed">
                                <p>
                                    {t.codeSentNotice} <strong className="font-semibold text-violet-950 dark:text-violet-100">{emailMasked}</strong>.
                                </p>
                                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                                    {t.checkInboxNotice}
                                </p>
                                {devFallbackCode && (
                                    <div className="mt-2.5 flex items-center justify-between gap-2 rounded-lg border border-amber-300/80 bg-amber-50/90 px-2.5 py-1.5 dark:border-amber-700/80 dark:bg-amber-950/60">
                                        <span className="text-[11px] text-amber-800 dark:text-amber-200">
                                            {t.devNotice} <strong className="font-mono text-xs font-bold text-amber-900 dark:text-amber-100">{devFallbackCode}</strong>
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setCode(devFallbackCode)}
                                            className="text-[11px] font-semibold text-amber-900 hover:underline dark:text-amber-200 cursor-pointer"
                                        >
                                            {t.useCode}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <TextField
                        label={t.codeLabel}
                        name="code"
                        value={code}
                        onChange={(e) => {
                            setCode(e.target.value)
                            if (error) setError('')
                        }}
                        placeholder={t.codePlaceholder}
                        icon={<KeyRound className="size-4" />}
                        maxLength={6}
                        autoFocus
                    />

                    <TextField
                        label={t.newPasswordLabel}
                        name="newPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => {
                            setNewPassword(e.target.value)
                            if (error) setError('')
                        }}
                        placeholder={t.newPasswordPlaceholder}
                        autoComplete="new-password"
                        icon={<Lock className="size-4" />}
                        trailing={
                            <button
                                type="button"
                                onClick={() => setShowNewPassword((v) => !v)}
                                aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                                className="flex size-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-200/60 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 cursor-pointer"
                            >
                                {showNewPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                            </button>
                        }
                    />

                    <TextField
                        label={t.confirmPasswordLabel}
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => {
                            setConfirmPassword(e.target.value)
                            if (error) setError('')
                        }}
                        placeholder={t.confirmPasswordPlaceholder}
                        autoComplete="new-password"
                        icon={<Lock className="size-4" />}
                        trailing={
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword((v) => !v)}
                                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                                className="flex size-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-200/60 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 cursor-pointer"
                            >
                                {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                            </button>
                        }
                    />

                    <button
                        type="submit"
                        disabled={loading || !code.trim() || !newPassword || !confirmPassword}
                        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-violet-700 to-indigo-600 font-semibold text-white shadow-md shadow-violet-600/25 transition-all hover:from-violet-500 hover:via-violet-600 hover:to-indigo-500 hover:shadow-lg hover:shadow-violet-600/30 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="size-4 animate-spin" />
                                <span>{isKm ? 'កំពុងដំណើរការ…' : 'Resetting…'}</span>
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="size-4" />
                                <span>{t.resetPassword}</span>
                            </>
                        )}
                    </button>

                    <div className="flex items-center justify-between pt-2 text-xs">
                        <button
                            type="button"
                            onClick={() => {
                                setStep(1)
                                setError('')
                            }}
                            className="font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 transition cursor-pointer"
                        >
                            {t.backStep}
                        </button>
                        <a
                            href={`/login${langParam ? `?lang=${langParam}` : ''}`}
                            className="inline-flex items-center gap-1 font-semibold text-violet-600 hover:underline dark:text-violet-400"
                        >
                            {t.backToLogin}
                        </a>
                    </div>
                </form>
            )}
        </AuthShell>
    )
}
