const variants = {
    default: 'border-transparent bg-violet-700 text-white [a&]:hover:bg-violet-800',
    secondary: 'border-transparent bg-slate-100 text-slate-700 [a&]:hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200',
    outline: 'border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-200',
    success: 'border-transparent bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200',
    destructive: 'border-transparent bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-200',
}

function Badge({className = '', variant = 'default', ...props}) {
    const classes = `inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[10px] font-semibold transition-colors ${variants[variant] || variants.default} ${className}`
    return <span data-slot="badge" className={classes} {...props}/>
}

export {Badge}
