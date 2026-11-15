import AuthShell from './AuthShell'
import CsrfField from './CsrfField'

export default function RegisterPage({dark, setDark}) {
    const query = new URLSearchParams(window.location.search)
    const locale = query.get('lang') || 'en'
    const failed = query.has('error')

    return (
        <AuthShell title="Create your account" dark={dark} setDark={setDark}>
            {failed &&
                <p className="my-3 rounded-lg bg-red-50 px-3 py-2.5 text-xs text-red-700" role="alert">Please check your
                    details and try again.</p>}
            <form method="post" action="/register"
                  className="my-5 grid gap-3.5 [&_label]:grid [&_label]:gap-1.5 [&_label]:text-xs [&_label]:font-medium [&_label]:text-slate-600 [&_input:not([type=hidden])]:h-10 [&_input:not([type=hidden])]:w-full [&_input:not([type=hidden])]:rounded-lg [&_input:not([type=hidden])]:border [&_input:not([type=hidden])]:border-slate-200 [&_input:not([type=hidden])]:px-3 [&_input:not([type=hidden])]:outline-none [&_input:not([type=hidden])]:focus:border-violet-400 [&_button]:h-10 [&_button]:rounded-lg [&_button]:bg-violet-700 [&_button]:font-semibold [&_button]:text-white">
                <CsrfField/>
                <input type="hidden" name="locale" value={locale}/>
                <label>Username<input name="username" minLength="3" maxLength="50" autoComplete="username"
                                      required/></label>
                <label>Email<input type="email" name="email" autoComplete="email" required/></label>
                <label>Given name<input name="givenName" autoComplete="given-name" required/></label>
                <label>Family name<input name="familyName" autoComplete="family-name" required/></label>
                <label>Password<input type="password" name="password" autoComplete="new-password" required/></label>
                <label>Confirm password<input type="password" name="confirmPassword" autoComplete="new-password"
                                              required/></label>
                <button type="submit">Create account</button>
            </form>
            <p className="text-xs text-slate-500"><a className="font-semibold text-violet-700" href="/login">Already
                have an account? Sign in</a></p>
        </AuthShell>
    )
}
