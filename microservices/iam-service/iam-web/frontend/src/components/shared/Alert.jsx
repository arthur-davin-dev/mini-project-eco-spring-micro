import {AlertCircle, CheckCircle2} from 'lucide-react'

const tones = {
    error: 'border-red-200/90 bg-red-50/90 text-red-800 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-200',
    success: 'border-emerald-200/90 bg-emerald-50/90 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/50 dark:text-emerald-200',
}

export default function Alert({tone = 'error', role = 'status', children}) {
    const Icon = tone === 'success' ? CheckCircle2 : AlertCircle
    return (
        <div
            className={`flex items-start gap-2.5 rounded-xl border p-3 text-xs leading-relaxed ${tones[tone] || tones.error} animate-in fade-in duration-200`}
            role={role}
        >
            <Icon className="size-4 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{children}</div>
        </div>
    )
}
