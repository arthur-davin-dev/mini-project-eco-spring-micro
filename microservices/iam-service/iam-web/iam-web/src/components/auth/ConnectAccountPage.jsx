import {useState} from 'react'
import {ArrowRight, CheckCircle2, ShieldCheck} from 'lucide-react'
import Field from '../common/Field'
import Button from '../ui/Button'

export default function ConnectAccountPage({loading, error, t, onConnect}) {
    const [accessToken, setAccessToken] = useState('')
    return (
        <section
            className="mx-auto grid max-w-lg gap-5 rounded-2xl border border-[var(--color-line)] bg-white p-7 shadow-lg dark:border-slate-700 dark:bg-slate-900">
            <div className="grid size-16 place-items-center rounded-2xl bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300">
                <ShieldCheck className="size-8" />
            </div>
            <div className="grid gap-2">
                <span
                    className="inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-bold tracking-wider text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                    <CheckCircle2 className="size-3" /> SECURE CONNECTION
                </span>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t.signIn}</h2>
                <p className="text-xs leading-5 text-slate-500">{loading ? t.loading : error || t.apiHint}</p>
                <form onSubmit={(event) => {
                    event.preventDefault();
                    onConnect(accessToken)
                }}>
                    <Field label={t.token} type="password" autoComplete="off" value={accessToken}
                           onChange={setAccessToken}/>
                    <Button variant="default" type="submit" className="inline-flex items-center gap-2">
                        {t.connectToken}
                        <ArrowRight className="size-4" />
                    </Button>
                </form>
                <small className="text-[10px] leading-5 text-slate-500">Token remains in this tab only and is cleared
                    when you sign out.</small>
            </div>
        </section>
    )
}
