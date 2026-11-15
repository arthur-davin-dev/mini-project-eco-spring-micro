import {formatProvider} from '../../utils/accountFormat'

const providers = ['google', 'github', 'facebook', 'telegram']
const providerMark = {google: 'G', github: '⌘', facebook: 'f', telegram: '➤'}
const card = 'rounded-xl border border-[var(--color-line)] bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900'

export default function LinkedAccountsPage({identities, working, t, onUnlink, onLink}) {
    return <section className={card}>
        <header className="mb-4 flex items-center gap-3"><span
            className="grid size-9 place-items-center rounded-lg bg-orange-50 text-orange-600">⌁</span>
            <div><h2 className="text-sm font-bold text-slate-800 dark:text-white">{t.linked}</h2><p
                className="mt-1 text-xs text-slate-500">{t.linkedSub}</p></div>
        </header>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {providers.map((provider) => {
                const identity = identities.find((item) => String(item.provider).toLowerCase() === provider)
                return <div className="flex flex-wrap items-center gap-3 py-4 first:pt-2" key={provider}>
                    <div
                        className="grid size-10 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-white">{providerMark[provider]}</div>
                    <div className="grid min-w-[120px] flex-1 gap-1"><b
                        className="text-xs text-slate-800 dark:text-white">{formatProvider(provider)}</b><small
                        className="text-[11px] text-slate-500">{identity ? identity.email || identity.displayName || t.connected : 'Not connected'}</small>
                    </div>
                    {identity && <span
                        className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">✓ {t.connected}</span>}
                    {identity ? <button
                            className="h-9 rounded-lg border border-red-200 px-3 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                            onClick={() => onUnlink(identity)} disabled={working}>{t.unlink}</button> :
                        <form onSubmit={(event) => onLink(event, provider)}>
                            <button
                                className="h-9 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"
                                type="submit">{t.connect} ＋
                            </button>
                        </form>}
                </div>
            })}
        </div>
        <div className="mt-3 flex gap-2 rounded-lg bg-slate-50 p-3 text-xs text-slate-500 dark:bg-slate-800"><span
            className="font-bold text-violet-600">i</span><p>{t.linkedText} Provider availability depends on the IAM
            server configuration.</p></div>
    </section>
}
