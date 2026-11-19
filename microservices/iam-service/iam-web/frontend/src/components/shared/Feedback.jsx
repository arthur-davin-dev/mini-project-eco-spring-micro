import {AlertCircle, CheckCircle2, X} from 'lucide-react'

export function Alert({message, onDismiss}) {
    if (!message) return null
    return (
        <div className="mb-4 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300" role="alert">
            <AlertCircle className="size-4 shrink-0 text-red-600 dark:text-red-400" />
            <span className="flex-1">{message}</span>
            <button className="ml-auto p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 cursor-pointer" onClick={onDismiss} aria-label="Dismiss">
                <X className="size-4" />
            </button>
        </div>
    )
}

export function Toast({message}) {
    if (!message) return null
    return (
        <div className="fixed right-5 top-20 z-50 flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-3 text-sm text-white shadow-xl dark:bg-slate-800 dark:border dark:border-slate-700" role="status">
            <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
            <span>{message}</span>
        </div>
    )
}

export function Loading({label}) {
    return (
        <div className="flex min-h-screen items-center justify-center gap-3 text-sm text-slate-500" role="status">
            <span className="size-4 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600"/>
            {label}
        </div>
    )
}
