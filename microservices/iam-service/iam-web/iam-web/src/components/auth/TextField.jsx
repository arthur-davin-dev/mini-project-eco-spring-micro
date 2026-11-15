import {useId} from 'react'

export default function TextField({label, trailing, ...inputProps}) {
    const id = useId()
    return (
        <div className="grid gap-1.5">
            <label htmlFor={id} className="text-xs font-medium text-slate-600 dark:text-slate-300">
                {label}
            </label>
            <div className="flex h-10 items-stretch rounded-lg border border-slate-200 bg-white
                            focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-200
                            dark:border-slate-700 dark:bg-slate-900 dark:focus-within:ring-violet-900">
                <input
                    id={id}
                    className="w-full min-w-0 bg-transparent px-3 text-sm outline-none dark:text-slate-100"
                    {...inputProps}
                />
                {trailing}
            </div>
        </div>
    )
}