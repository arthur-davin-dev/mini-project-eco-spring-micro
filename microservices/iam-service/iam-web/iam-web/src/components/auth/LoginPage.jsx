// import {useEffect, useState} from 'react'
// import AuthShell from './AuthShell'
// import CsrfField from './CsrfField'
//
// export default function LoginPage({dark, setDark}) {
//     const query = new URLSearchParams(window.location.search)
//     const hasError = query.has('error') || query.has('oauth_error')
//     const registered = query.has('registered')
//     const [providers, setProviders] = useState([])
//
//     useEffect(() => {
//         fetch('/account/providers')
//             .then(response => response.ok ? response.json() : [])
//             .then(setProviders)
//             .catch(() => setProviders([]))
//     }, [])
//
//     return (
//         <AuthShell title="Sign in" dark={dark} setDark={setDark}>
//             <p className="text-sm leading-6 text-slate-500">Sign in to manage your identity and connected services.</p>
//             {hasError &&
//                 <p className="my-3 rounded-lg bg-red-50 px-3 py-2.5 text-xs text-red-700" role="alert">Sign-in failed.
//                     Check your details and try again.</p>}
//             {registered &&
//                 <p className="my-3 rounded-lg bg-emerald-50 px-3 py-2.5 text-xs text-emerald-700" role="status">Your
//                     account was created. You can sign in now.</p>}
//             <form method="post" action="/login"
//                   className="my-5 grid gap-3.5 [&_label]:grid [&_label]:gap-1.5 [&_label]:text-xs [&_label]:font-medium [&_label]:text-slate-600 [&_input:not([type=hidden])]:h-10 [&_input:not([type=hidden])]:w-full [&_input:not([type=hidden])]:rounded-lg [&_input:not([type=hidden])]:border [&_input:not([type=hidden])]:border-slate-200 [&_input:not([type=hidden])]:px-3 [&_input:not([type=hidden])]:outline-none [&_input:not([type=hidden])]:focus:border-violet-400 [&_button]:h-10 [&_button]:rounded-lg [&_button]:bg-violet-700 [&_button]:font-semibold [&_button]:text-white">
//                 <CsrfField/>
//                 <label>Username<input name="username" autoComplete="username" required/></label>
//                 <label>Password<input type="password" name="password" autoComplete="current-password" required/></label>
//                 <button type="submit">Sign in</button>
//             </form>
//             <p className="text-xs text-slate-500">New here? <a className="font-semibold text-violet-700"
//                                                                href="/register">Create an account</a></p>
//             {providers.length > 0 && (
//                 <div className="mt-6 flex flex-wrap items-center gap-2.5 text-xs">
//                     <span className="w-full text-slate-500">Or continue with</span>
//                     {providers.map(provider => (
//                         <a className="rounded-lg border border-slate-200 px-3 py-2 text-slate-700 hover:bg-slate-50"
//                            key={provider} href={`/oauth2/authorization/${provider}`}>
//                             {provider[0].toUpperCase() + provider.slice(1)}
//                         </a>
//                     ))}
//                 </div>
//             )}
//         </AuthShell>
//     )
// }


import {useEffect, useMemo, useState} from 'react'
import AuthShell from './AuthShell'
import CsrfField from './CsrfField'
import Alert from './Alert'
import TextField from './TextField'

const providerLabel = name =>
    typeof name === 'string' && name ? name.charAt(0).toUpperCase() + name.slice(1) : ''

export default function LoginPage({dark, setDark}) {
    const query = useMemo(() => new URLSearchParams(window.location.search), [])
    const oauthError = query.has('oauth_error')
    const loginError = query.has('error')
    const registered = query.has('registered')

    const [providers, setProviders] = useState([])
    const [csrfReady, setCsrfReady] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    useEffect(() => {
        const controller = new AbortController()
        fetch('/account/providers', {signal: controller.signal})
            .then(response => (response.ok ? response.json() : []))
            .then(data => setProviders(Array.isArray(data) ? data.filter(providerLabel) : []))
            .catch(error => {
                if (error.name !== 'AbortError') setProviders([])
            })
        return () => controller.abort()
    }, [])

    return (
        <AuthShell title="Sign in" dark={dark} setDark={setDark}>
            <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
                Sign in to manage your identity and connected services.
            </p>

            <div className="my-3 grid gap-2">
                {loginError && (
                    <Alert tone="error" role="alert">
                        Incorrect username or password. Please try again.
                    </Alert>
                )}
                {oauthError && (
                    <Alert tone="error" role="alert">
                        We couldn't sign you in with that provider. Try again or use your password.
                    </Alert>
                )}
                {registered && (
                    <Alert tone="success" role="status">
                        Your account was created. You can sign in now.
                    </Alert>
                )}
            </div>

            <form
                method="post"
                action="/login"
                className="my-5 grid gap-4"
                onSubmit={() => setSubmitting(true)}
            >
                <CsrfField onReady={setCsrfReady}/>

                <TextField
                    label="Username"
                    name="username"
                    autoComplete="username"
                    autoFocus
                    required
                />

                <TextField
                    label="Password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    trailing={
                        <button
                            type="button"
                            onClick={() => setShowPassword(v => !v)}
                            aria-pressed={showPassword}
                            className="px-3 text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                        >
                            {showPassword ? 'Hide' : 'Show'}
                        </button>
                    }
                />

                <button
                    type="submit"
                    disabled={!csrfReady || submitting}
                    className="h-10 rounded-lg bg-violet-700 font-semibold text-white transition
                               hover:bg-violet-800 focus-visible:outline-2 focus-visible:outline-offset-2
                               focus-visible:outline-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {submitting ? 'Signing in…' : 'Sign in'}
                </button>
            </form>

            <p className="text-xs text-slate-500 dark:text-slate-400">
                New here?{' '}
                <a className="font-semibold text-violet-700 hover:underline dark:text-violet-400" href="/register">
                    Create an account
                </a>
            </p>

            {providers.length > 0 && (
                <section className="mt-6" aria-labelledby="oauth-heading">
                    <h2 id="oauth-heading" className="mb-2.5 text-xs text-slate-500 dark:text-slate-400">
                        Or continue with
                    </h2>
                    <ul className="flex flex-wrap gap-2.5 text-xs">
                        {providers.map(provider => (
                            <li key={provider}>
                                <a
                                    className="block rounded-lg border border-slate-200 px-3 py-2 text-slate-700
                                               hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-violet-500
                                               dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                                    href={`/oauth2/authorization/${encodeURIComponent(provider)}`}
                                >
                                    {providerLabel(provider)}
                                </a>
                            </li>
                        ))}
                    </ul>
                </section>
            )}
        </AuthShell>
    )
}