import {useState} from 'react'
import Field from '../common/Field'

const emptyPassword = {currentPassword: '', newPassword: '', confirmPassword: ''}

export default function SecurityPage({t, working, onSave}) {
    const [password, setPassword] = useState(emptyPassword)

    async function submit(event) {
        event.preventDefault()
        if (await onSave(password)) setPassword(emptyPassword)
    }

    return <section
        className="rounded-xl border border-[var(--color-line)] bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <header className="flex items-center gap-3"><span
            className="grid size-9 place-items-center rounded-lg bg-emerald-50 text-emerald-700">◇</span>
            <div><h2 className="text-sm font-bold text-slate-800 dark:text-white">{t.security}</h2><p
                className="mt-1 text-xs text-slate-500">{t.securityText}</p></div>
            <span className="ml-auto rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">● Protected</span>
        </header>
        <form className="mt-6 grid max-w-2xl gap-4" onSubmit={submit}>
            <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-4 dark:bg-slate-800"><span
                className="grid size-10 place-items-center rounded-lg bg-violet-100 text-violet-700">⌑</span>
                <div><b className="text-xs text-slate-800 dark:text-white">{t.changePassword}</b><p
                    className="mt-1 text-[11px] text-slate-500">{t.passwordRule}</p></div>
            </div>
            <Field label={t.currentPassword} type="password" autoComplete="current-password"
                   value={password.currentPassword}
                   onChange={(currentPassword) => setPassword({...password, currentPassword})}/>
            <Field label={t.newPassword} type="password" autoComplete="new-password" value={password.newPassword}
                   onChange={(newPassword) => setPassword({...password, newPassword})}/>
            <Field label={t.confirmPassword} type="password" autoComplete="new-password"
                   value={password.confirmPassword}
                   onChange={(confirmPassword) => setPassword({...password, confirmPassword})}/>
            <div
                className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                <span className="text-[10px] text-slate-500">{t.note}</span>
                <button
                    className="h-9 rounded-lg bg-violet-700 px-4 text-xs font-semibold text-white hover:bg-violet-800 disabled:opacity-50"
                    type="submit" disabled={working}>{working ? '…' : t.updatePassword} →
                </button>
            </div>
        </form>
    </section>
}
