import {Check, Info, Link2, Plus} from 'lucide-react'
import {formatProvider} from '../../utils/accountFormat'

const providers = ['google', 'github', 'facebook', 'telegram']

function GoogleIcon({className = 'size-5'}) {
    return (
        <svg className={className} viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
        </svg>
    )
}

function GithubIcon({className = 'size-5'}) {
    return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
        </svg>
    )
}

function FacebookIcon({className = 'size-5'}) {
    return (
        <svg className={className} fill="#1877F2" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
    )
}

function TelegramIcon({className = 'size-5'}) {
    return (
        <svg className={className} fill="#229ED9" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
        </svg>
    )
}

function getProviderIcon(provider) {
    switch (provider) {
        case 'google':
            return <GoogleIcon className="size-5" />
        case 'github':
            return <GithubIcon className="size-5 text-slate-900 dark:text-white" />
        case 'facebook':
            return <FacebookIcon className="size-5" />
        case 'telegram':
            return <TelegramIcon className="size-5" />
        default:
            return <Link2 className="size-5 text-slate-500" />
    }
}

const card = 'rounded-xl border border-[var(--color-line)] bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900'

export default function LinkedAccountsPage({identities, working, t, onUnlink, onLink}) {
    return (
        <section className={card}>
            <header className="mb-4 flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-lg bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400">
                    <Link2 className="size-4.5" />
                </span>
                <div>
                    <h2 className="text-sm font-medium text-slate-800 dark:text-white">{t.linked}</h2>
                    <p className="mt-1 text-xs text-slate-500">{t.linkedSub}</p>
                </div>
            </header>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {providers.map((provider) => {
                    const identity = identities.find((item) => String(item.provider).toLowerCase() === provider)
                    return (
                        <div className="flex flex-wrap items-center gap-3 py-4 first:pt-2" key={provider}>
                            <div className="grid size-10 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-white shadow-xs">
                                {getProviderIcon(provider)}
                            </div>
                            <div className="grid min-w-[120px] flex-1 gap-1">
                                <b className="text-xs font-medium text-slate-800 dark:text-white">{formatProvider(provider)}</b>
                                <small className="text-[11px] text-slate-500">{identity ? identity.email || identity.displayName || t.connected : 'Not connected'}</small>
                            </div>
                            {identity && (
                                <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                                    <Check className="size-3" />
                                    {t.connected}
                                </span>
                            )}
                            {identity ? (
                                <button
                                    className="h-9 rounded-lg border border-red-200 px-3 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30 cursor-pointer"
                                    onClick={() => onUnlink(identity)}
                                    disabled={working}
                                >
                                    {t.unlink}
                                </button>
                            ) : (
                                <form onSubmit={(event) => onLink(event, provider)}>
                                    <button
                                        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 cursor-pointer"
                                        type="submit"
                                    >
                                        <Plus className="size-3.5" />
                                        {t.connect}
                                    </button>
                                </form>
                            )}
                        </div>
                    )
                })}
            </div>
            <div className="mt-3 flex items-start gap-2.5 rounded-lg bg-slate-50 p-3 text-xs text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
                <Info className="size-4 shrink-0 text-violet-600 mt-0.5" />
                <p className="leading-relaxed">
                    {t.linkedText} Provider availability depends on the IAM server configuration.
                </p>
            </div>
        </section>
    )
}
