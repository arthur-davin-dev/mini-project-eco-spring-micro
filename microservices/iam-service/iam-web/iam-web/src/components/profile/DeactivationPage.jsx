import {useState} from 'react'

export default function DeactivationPage({user, t, onBack}) {
    const [confirmed, setConfirmed] = useState(false)
    const requestHref = `mailto:support@istad.co?subject=${encodeURIComponent('Account deactivation request')}&body=${encodeURIComponent(`Please review my account deactivation request.\nAccount: ${user.username}\nEmail: ${user.email}`)}`
    return <section
        className="rounded-xl border border-red-200 bg-white p-5 shadow-sm dark:border-red-950 dark:bg-slate-900">
        <header className="flex items-center gap-3"><span
            className="grid size-10 place-items-center rounded-xl bg-red-50 text-lg font-bold text-red-600">!</span>
            <div><span className="text-[10px] font-bold uppercase tracking-wider text-red-500">Account control</span><h2
                className="mt-1 text-base font-bold text-slate-900 dark:text-white">{t.deactivate}</h2><p
                className="mt-1 text-xs text-slate-500">{t.deactivateDesc}</p></div>
        </header>
        <div className="mt-6 rounded-lg border border-red-100 bg-red-50/70 p-4 dark:border-red-950 dark:bg-red-950/20">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-white">{t.dangerTitle}</h3><p
            className="mt-2 text-xs leading-5 text-slate-600 dark:text-slate-300">{t.dangerText}</p><label
            className="mt-4 flex items-start gap-2 text-xs text-slate-700 dark:text-slate-200"><input
            className="mt-0.5 accent-red-600" type="checkbox" checked={confirmed}
            onChange={(event) => setConfirmed(event.target.checked)}/><span>{t.confirm}</span></label><a
            className={`mt-4 inline-flex h-9 items-center gap-2 rounded-lg px-4 text-xs font-semibold text-white ${confirmed ? 'bg-red-600 hover:bg-red-700' : 'pointer-events-none bg-slate-300'}`}
            aria-disabled={!confirmed} href={confirmed ? requestHref : undefined}>{t.request} →</a></div>
        <button className="mt-5 text-xs font-semibold text-violet-700 hover:underline"
                onClick={onBack}>← {t.back}</button>
        <div
            className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-500 dark:bg-slate-800">ⓘ {t.unavailableText}</div>
    </section>
}
