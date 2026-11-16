import {useState} from 'react'
import {
    ShieldCheck,
    KeyRound,
    Lock,
    Check,
    X,
    AlertCircle,
    Info,
    ArrowRight,
    Eye,
    EyeOff
} from 'lucide-react'
import Field from '../common/Field'
import {Card} from '../ui/card'
import {Button} from '../ui/button'
import {changePasswordSchema, validateForm} from '../../utils/validation'

const card = 'rounded-xl border border-[var(--color-line)] bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900'

function evaluatePassword(pwd) {
    if (!pwd) return {score: 0, text: '', color: 'bg-slate-200'}
    let score = 0
    if (pwd.length >= 8) score++
    if (/[A-Z]/.test(pwd)) score++
    if (/[a-z]/.test(pwd)) score++
    if (/[0-9]/.test(pwd)) score++
    if (/[^A-Za-z0-9]/.test(pwd)) score++

    if (score <= 2) return {score: 1, text: 'Weak', color: 'bg-red-500'}
    if (score === 3) return {score: 2, text: 'Fair', color: 'bg-amber-500'}
    if (score === 4) return {score: 3, text: 'Good', color: 'bg-blue-500'}
    return {score: 4, text: 'Strong', color: 'bg-emerald-500'}
}

export default function SecurityPage({t, working, onSave, locale}) {
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [resetSuccess, setResetSuccess] = useState(false)
    const [formError, setFormError] = useState('')

    const strength = evaluatePassword(newPassword)

    const rules = [
        {label: locale === 'km' ? 'យ៉ាងហោច 8 តួអក្សរ' : 'At least 8 characters', met: newPassword.length >= 8},
        {
            label: locale === 'km' ? 'អក្សរធំយ៉ាងហោច 1 (A-Z)' : 'At least one uppercase letter (A-Z)',
            met: /[A-Z]/.test(newPassword)
        },
        {
            label: locale === 'km' ? 'អក្សរតូចយ៉ាងហោច 1 (a-z)' : 'At least one lowercase letter (a-z)',
            met: /[a-z]/.test(newPassword)
        },
        {label: locale === 'km' ? 'លេខយ៉ាងហោច 1 (0-9)' : 'At least one number (0-9)', met: /[0-9]/.test(newPassword)},
        {
            label: locale === 'km' ? 'និមិត្តសញ្ញាពិសេស (!@#$)' : 'At least one special character (!@#$)',
            met: /[^A-Za-z0-9]/.test(newPassword)
        },
    ]

    async function submit(event) {
        event.preventDefault()
        setFormError('')
        const validation = validateForm(changePasswordSchema, {currentPassword, newPassword, confirmPassword})
        if (!validation.success) {
            setFormError(validation.firstErrorMessage)
            return
        }
        const success = await onSave({currentPassword, newPassword, confirmPassword})
        if (success) {
            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')
            setFormError('')
            setResetSuccess(true)
            setTimeout(() => setResetSuccess(false), 4000)
        }
    }

    return (
        <div className="grid gap-6 max-w-4xl">
            {/* Password Update Card */}
            <section className={card}>
                <header
                    className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <span
                            className="grid size-9 place-items-center rounded-lg bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                            <KeyRound className="size-5"/>
                        </span>
                        <div>
                            <h2 className="text-sm font-medium text-slate-800 dark:text-white">
                                {t.security || 'Security & Password'}
                            </h2>
                            <p className="mt-0.5 text-xs text-slate-500">
                                {t.securityText || 'Keep your account protected with a strong, distinct password.'}
                            </p>
                        </div>
                    </div>
                </header>

                {formError && (
                    <div
                        className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-100">
                        <AlertCircle className="size-4 shrink-0 text-red-600 dark:text-red-400"/>
                        <span>{formError}</span>
                    </div>
                )}

                <form className="grid gap-4 sm:grid-cols-2" onSubmit={submit}>
                    <div className="sm:col-span-2">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                {t.currentPassword || 'Current password'}
                            </span>
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-600"
                            >
                                {showPassword ? <EyeOff className="size-3"/> : <Eye className="size-3"/>}
                                {showPassword ? 'Hide' : 'Show'}
                            </button>
                        </div>
                        <Field
                            label=""
                            type={showPassword ? 'text' : 'password'}
                            value={currentPassword}
                            placeholder="••••••••••••"
                            onChange={setCurrentPassword}
                            required
                        />
                    </div>

                    <div>
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                            {t.newPassword || 'New password'}
                        </span>
                        <Field
                            label=""
                            type={showPassword ? 'text' : 'password'}
                            value={newPassword}
                            placeholder="••••••••••••"
                            onChange={setNewPassword}
                            required
                        />
                    </div>

                    <div>
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                            {t.confirmPassword || 'Confirm new password'}
                        </span>
                        <Field
                            label=""
                            type={showPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            placeholder="••••••••••••"
                            onChange={setConfirmPassword}
                            required
                        />
                    </div>

                    {/* Password Strength Meter */}
                    {newPassword && (
                        <div
                            className="sm:col-span-2 rounded-xl border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-900/40">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                    {locale === 'km' ? 'កម្រិតសុវត្ថិភាពពាក្យសម្ងាត់:' : 'Password strength:'}
                                </span>
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                    {strength.text}
                                </span>
                            </div>
                            <div
                                className="grid grid-cols-4 gap-1.5 h-1.5 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800">
                                <div className={`h-full ${strength.score >= 1 ? strength.color : 'bg-transparent'}`}/>
                                <div className={`h-full ${strength.score >= 2 ? strength.color : 'bg-transparent'}`}/>
                                <div className={`h-full ${strength.score >= 3 ? strength.color : 'bg-transparent'}`}/>
                                <div className={`h-full ${strength.score >= 4 ? strength.color : 'bg-transparent'}`}/>
                            </div>

                            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                                {rules.map((rule, idx) => (
                                    <span
                                        key={idx}
                                        className={`flex items-center gap-1.5 ${
                                            rule.met ? 'text-emerald-600 font-medium' : 'text-slate-400'
                                        }`}
                                    >
                                        {rule.met ? <Check className="size-3.5"/> : <X className="size-3.5"/>}
                                        {rule.label}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    <div
                        className="sm:col-span-2 flex items-center justify-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                        <Button
                            type="submit"
                            disabled={working}
                            className="bg-violet-700 hover:bg-violet-800 text-white font-semibold text-xs"
                        >
                            {working ? '…' : (
                                <>
                                    {t.updatePassword || 'Update password'}
                                    <ArrowRight className="size-4 ml-1.5"/>
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </section>

            {/* Account Security Overview */}
            <div className="grid gap-4 sm:grid-cols-3">
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <span
                            className="grid size-9 place-items-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                            <ShieldCheck className="size-5"/>
                        </span>
                        <div>
                            <p className="text-xs text-slate-500">{locale === 'km' ? 'ស្ថានភាពពាក្យសម្ងាត់' : 'Password status'}</p>
                            <p className="text-xs font-bold text-slate-800 dark:text-white">Active &amp; Encrypted</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <span
                            className="grid size-9 place-items-center rounded-lg bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                            <Lock className="size-5"/>
                        </span>
                        <div>
                            <p className="text-xs text-slate-500">{locale === 'km' ? 'ការផ្ទៀងផ្ទាត់ 2FA' : 'Two-Factor (MFA)'}</p>
                            <p className="text-xs font-bold text-slate-800 dark:text-white">Optional for user</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <span
                            className="grid size-9 place-items-center rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                            <Info className="size-5"/>
                        </span>
                        <div>
                            <p className="text-xs text-slate-500">{locale === 'km' ? 'ការផុតកំណត់' : 'Expiration policy'}</p>
                            <p className="text-xs font-bold text-slate-800 dark:text-white">90 days policy</p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    )
}
