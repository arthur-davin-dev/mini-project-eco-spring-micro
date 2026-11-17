import {useMemo, useState} from 'react'
import {
    User,
    Mail,
    Lock,
    Eye,
    EyeOff,
    UserPlus,
    LogIn,
    Loader2,
    ShieldCheck,
} from 'lucide-react'
import AuthShell from './AuthShell'
import CsrfField from './CsrfField'
import Alert from './Alert'
import TextField from './TextField'
import {getRegisterSchema, validateForm} from '../../utils/validation'

export default function RegisterPage({dark, setDark}) {
    const query = useMemo(() => new URLSearchParams(typeof window !== 'undefined' ? window.location.search : ''), [])
    const failed = query.has('error')
    const langParam = query.get('lang')
    const isKm = langParam === 'km' || (!langParam && typeof window !== 'undefined' && (localStorage.getItem('iam-locale') === 'km' || localStorage.getItem('iam-lang') === 'km'))

    const [csrfReady, setCsrfReady] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [fieldErrors, setFieldErrors] = useState({})
    const [formError, setFormError] = useState('')

    const t = useMemo(() => {
        if (isKm) {
            return {
                title: 'បង្កើតគណនីថ្មី',
                subtitle: 'បញ្ចូលព័ត៌មានរបស់អ្នកដើម្បីបង្កើតគណនី ISTAD Identity។',
                usernameLabel: 'ឈ្មោះអ្នកប្រើប្រាស់',
                usernamePlaceholder: 'ឧ. chhay_davin',
                emailLabel: 'អាសយដ្ឋានអ៊ីមែល',
                emailPlaceholder: 'name@example.com',
                givenNameLabel: 'នាមខ្លួន',
                givenNamePlaceholder: 'ឧ. ដាវីន',
                familyNameLabel: 'នាមត្រកូល',
                familyNamePlaceholder: 'ឧ. ឆាយ',
                passwordLabel: 'ពាក្យសម្ងាត់',
                passwordPlaceholder: 'យ៉ាងតិច 8 តួអក្សរ',
                confirmPasswordLabel: 'បញ្ជាក់ពាក្យសម្ងាត់',
                confirmPasswordPlaceholder: 'បញ្ចូលពាក្យសម្ងាត់ម្តងទៀត',
                createAccount: 'បង្កើតគណនី',
                creatingAccount: 'កំពុងបង្កើតគណនី…',
                alreadyHaveAccount: 'មានគណនីរួចហើយមែនទេ?',
                signIn: 'ចូលគណនី',
                showPassword: 'បង្ហាញពាក្យសម្ងាត់',
                hidePassword: 'លាក់ពាក្យសម្ងាត់',
                generalError: 'សូមពិនិត្យមើលព័ត៌មានរបស់អ្នក ហើយព្យាយាមម្តងទៀត។',
            }
        }
        return {
            title: 'Create your account',
            subtitle: 'Enter your details to register for ISTAD Identity.',
            usernameLabel: 'Username',
            usernamePlaceholder: 'e.g. chhay_davin',
            emailLabel: 'Email address',
            emailPlaceholder: 'name@example.com',
            givenNameLabel: 'Given name',
            givenNamePlaceholder: 'e.g. Davin',
            familyNameLabel: 'Family name',
            familyNamePlaceholder: 'e.g. Chhay',
            passwordLabel: 'Password',
            passwordPlaceholder: 'At least 8 characters',
            confirmPasswordLabel: 'Confirm password',
            confirmPasswordPlaceholder: 'Re-enter your password',
            createAccount: 'Create account',
            creatingAccount: 'Creating account…',
            alreadyHaveAccount: 'Already have an account?',
            signIn: 'Sign in',
            showPassword: 'Show password',
            hidePassword: 'Hide password',
            generalError: 'Please check your details and try again.',
        }
    }, [isKm])

    function handleFieldChange(field) {
        if (fieldErrors[field]) {
            setFieldErrors(prev => {
                const next = {...prev}
                delete next[field]
                return next
            })
        }
        if (formError) setFormError('')
    }

    function handleFieldBlur(field, e) {
        const val = e.target.value?.trim() || ''
        if (!val) return

        const schema = getRegisterSchema(isKm ? 'km' : 'en')
        const fieldValidator = schema.shape?.[field]
        if (fieldValidator) {
            const res = fieldValidator.safeParse(val)
            if (!res.success) {
                setFieldErrors(prev => ({
                    ...prev,
                    [field]: res.error.issues[0]?.message,
                }))
            } else if (fieldErrors[field]) {
                setFieldErrors(prev => {
                    const next = {...prev}
                    delete next[field]
                    return next
                })
            }
        }
    }

    function handleConfirmBlur(e) {
        const confirmVal = e.target.value || ''
        const passVal = document.querySelector('input[name="password"]')?.value || ''
        if (confirmVal && passVal && confirmVal !== passVal) {
            setFieldErrors(prev => ({
                ...prev,
                confirmPassword: isKm ? 'ពាក្យសម្ងាត់ទាំងពីរមិនត្រូវគ្នាទេ' : 'The passwords do not match',
            }))
        } else if (confirmVal && passVal && confirmVal === passVal && fieldErrors.confirmPassword) {
            setFieldErrors(prev => {
                const next = {...prev}
                delete next.confirmPassword
                return next
            })
        }
    }

    function handleSubmit(e) {
        const form = e.currentTarget
        const values = {
            username: form.username?.value?.trim() || '',
            email: form.email?.value?.trim() || '',
            givenName: form.givenName?.value?.trim() || '',
            familyName: form.familyName?.value?.trim() || '',
            password: form.password?.value || '',
            confirmPassword: form.confirmPassword?.value || '',
            locale: isKm ? 'km' : 'en',
        }

        const schema = getRegisterSchema(isKm ? 'km' : 'en')
        const validation = validateForm(schema, values)

        if (!validation.success) {
            e.preventDefault()
            setFieldErrors(validation.errors)
            setFormError(validation.firstErrorMessage)
            return
        }

        setFieldErrors({})
        setFormError('')
        setSubmitting(true)
    }

    return (
        <AuthShell title={t.title} dark={dark} setDark={setDark}>
            <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
                {t.subtitle}
            </p>

            <div className="my-3 grid gap-2">
                {formError && (
                    <Alert tone="error" role="alert">
                        {formError}
                    </Alert>
                )}
                {failed && !formError && (
                    <Alert tone="error" role="alert">
                        {t.generalError}
                    </Alert>
                )}
            </div>

            <form
                method="post"
                action="/register"
                noValidate
                className="my-5 grid gap-4"
                onSubmit={handleSubmit}
            >
                <CsrfField onReady={setCsrfReady}/>
                <input type="hidden" name="locale" value={isKm ? 'km' : 'en'}/>

                <TextField
                    label={t.usernameLabel}
                    name="username"
                    placeholder={t.usernamePlaceholder}
                    autoComplete="username"
                    icon={<User className="size-4" />}
                    error={fieldErrors.username}
                    onChange={() => handleFieldChange('username')}
                    onBlur={(e) => handleFieldBlur('username', e)}
                    autoFocus
                />

                <TextField
                    label={t.emailLabel}
                    name="email"
                    type="email"
                    placeholder={t.emailPlaceholder}
                    autoComplete="email"
                    icon={<Mail className="size-4" />}
                    error={fieldErrors.email}
                    onChange={() => handleFieldChange('email')}
                    onBlur={(e) => handleFieldBlur('email', e)}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <TextField
                        label={t.givenNameLabel}
                        name="givenName"
                        placeholder={t.givenNamePlaceholder}
                        autoComplete="given-name"
                        icon={<User className="size-4" />}
                        error={fieldErrors.givenName}
                        onChange={() => handleFieldChange('givenName')}
                        onBlur={(e) => handleFieldBlur('givenName', e)}
                    />

                    <TextField
                        label={t.familyNameLabel}
                        name="familyName"
                        placeholder={t.familyNamePlaceholder}
                        autoComplete="family-name"
                        icon={<User className="size-4" />}
                        error={fieldErrors.familyName}
                        onChange={() => handleFieldChange('familyName')}
                        onBlur={(e) => handleFieldBlur('familyName', e)}
                    />
                </div>

                <TextField
                    label={t.passwordLabel}
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t.passwordPlaceholder}
                    autoComplete="new-password"
                    icon={<Lock className="size-4" />}
                    error={fieldErrors.password}
                    onChange={() => handleFieldChange('password')}
                    onBlur={(e) => handleFieldBlur('password', e)}
                    trailing={
                        <button
                            type="button"
                            onClick={() => setShowPassword(v => !v)}
                            aria-pressed={showPassword}
                            aria-label={showPassword ? t.hidePassword : t.showPassword}
                            title={showPassword ? t.hidePassword : t.showPassword}
                            className="flex size-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-200/60 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 cursor-pointer"
                        >
                            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                    }
                />

                <TextField
                    label={t.confirmPasswordLabel}
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder={t.confirmPasswordPlaceholder}
                    autoComplete="new-password"
                    icon={<ShieldCheck className="size-4" />}
                    error={fieldErrors.confirmPassword}
                    onChange={() => handleFieldChange('confirmPassword')}
                    onBlur={handleConfirmBlur}
                    trailing={
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(v => !v)}
                            aria-pressed={showConfirmPassword}
                            aria-label={showConfirmPassword ? t.hidePassword : t.showPassword}
                            title={showConfirmPassword ? t.hidePassword : t.showPassword}
                            className="flex size-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-200/60 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 cursor-pointer"
                        >
                            {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                    }
                />

                <button
                    type="submit"
                    disabled={!csrfReady || submitting}
                    className="mt-1 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-violet-700 to-indigo-600 font-semibold text-white shadow-md shadow-violet-600/25 transition-all hover:from-violet-500 hover:via-violet-600 hover:to-indigo-500 hover:shadow-lg hover:shadow-violet-600/30 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                >
                    {submitting ? (
                        <>
                            <Loader2 className="size-4.5 animate-spin" />
                            <span>{t.creatingAccount}</span>
                        </>
                    ) : (
                        <>
                            <UserPlus className="size-4.5" />
                            <span>{t.createAccount}</span>
                        </>
                    )}
                </button>
            </form>

            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <span>{t.alreadyHaveAccount}</span>
                <a
                    className="inline-flex items-center gap-1 font-semibold text-violet-600 hover:text-violet-700 hover:underline dark:text-violet-400 dark:hover:text-violet-300 transition"
                    href={`/login${isKm ? '?lang=km' : ''}`}
                >
                    <LogIn className="size-3.5" />
                    <span>{t.signIn}</span>
                </a>
            </div>
        </AuthShell>
    )
}
