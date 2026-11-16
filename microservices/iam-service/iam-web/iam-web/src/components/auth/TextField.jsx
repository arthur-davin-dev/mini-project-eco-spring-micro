import {useId} from 'react'

export default function TextField({label, icon, trailing, error, ...inputProps}) {
    const id = useId()
    return (
        <div className="grid gap-1.5">
            {label && (
                <label
                    htmlFor={id}
                    className={`text-xs font-semibold transition-colors ${
                        error ? 'text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-300'
                    }`}
                >
                    {label}
                </label>
            )}
            <div
                className={`group flex h-11 items-center rounded-xl border px-3 transition-all ${
                    error
                        ? 'border-red-500 bg-red-50/20 focus-within:border-red-500 focus-within:ring-4 focus-within:ring-red-500/15 dark:border-red-500/80 dark:bg-red-950/20 dark:focus-within:ring-red-500/20'
                        : 'border-slate-200/90 bg-slate-50/60 focus-within:border-violet-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-violet-500/15 dark:border-slate-800 dark:bg-slate-950/60 dark:focus-within:border-violet-400 dark:focus-within:bg-slate-950 dark:focus-within:ring-violet-500/20'
                }`}
            >
                {icon && (
                    <div
                        className={`mr-2.5 transition-colors shrink-0 ${
                            error
                                ? 'text-red-500 dark:text-red-400'
                                : 'text-slate-400 group-focus-within:text-violet-600 dark:group-focus-within:text-violet-400'
                        }`}
                    >
                        {icon}
                    </div>
                )}
                <input
                    id={id}
                    className="w-full min-w-0 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none dark:text-slate-100 dark:placeholder:text-slate-500"
                    {...inputProps}
                />
                {trailing && (
                    <div className="ml-2 flex items-center shrink-0">
                        {trailing}
                    </div>
                )}
            </div>
            {error && (
                <p className="text-[11px] font-medium text-red-600 dark:text-red-400 animate-in fade-in duration-150">
                    {error}
                </p>
            )}
        </div>
    )
}
