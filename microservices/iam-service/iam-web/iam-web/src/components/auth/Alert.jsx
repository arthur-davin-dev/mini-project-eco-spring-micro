const tones = {
    error: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-200',
    success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200',
}

export default function Alert({tone = 'error', role = 'status', children}) {
    return (
        <p className={`rounded-lg px-3 py-2.5 text-xs ${tones[tone]}`} role={role}>
            {children}
        </p>
    )
}