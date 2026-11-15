export function Alert({message, onDismiss}) {
    if (!message) return null
    return <div className="mb-4 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert"><span>!</span>{message}<button className="ml-auto text-lg" onClick={onDismiss} aria-label="Dismiss">×</button></div>
}

export function Toast({message}) {
    if (!message) return null
    return <div className="fixed right-5 top-20 z-50 flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-3 text-sm text-white shadow-xl" role="status"><span>✓</span>{message}</div>
}

export function Loading({label}) {
    return <div className="flex min-h-screen items-center justify-center gap-3 text-sm text-slate-500" role="status"><span className="size-4 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600"/>{label}</div>
}
