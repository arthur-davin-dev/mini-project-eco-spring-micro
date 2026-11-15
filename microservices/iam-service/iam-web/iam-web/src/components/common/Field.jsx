export default function Field({label, value, onChange, disabled = false, type = 'text', autoComplete}) {
    return (
        <label className="grid gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">
            <span>{label}</span>
            <input
                className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 disabled:bg-slate-50 disabled:text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-violet-950"
                type={type}
                value={value ?? ''}
                disabled={disabled}
                autoComplete={autoComplete}
                onChange={(event) => onChange?.(event.target.value)}
            />
        </label>
    )
}
