export default function Button({variant = 'outline', size, className = '', children, ...props}) {
    const variants = {
        primary: 'bg-violet-700 text-white hover:bg-violet-800',
        outline: 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200',
        secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100',
        destructive: 'bg-red-600 text-white hover:bg-red-700',
        ghost: 'text-slate-600 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800',
        link: 'text-violet-700 underline-offset-4 hover:underline',
    }
    const classes = [
        'inline-flex items-center justify-center gap-2 rounded-lg px-3 text-xs font-semibold transition disabled:pointer-events-none disabled:opacity-50',
        variants[variant] || variants.outline,
        variant === 'primary' || variant === 'destructive' ? 'h-10' : 'h-9',
        size === 'small' ? 'h-8 px-2.5' : '',
        className,
    ].filter(Boolean).join(' ')
    return <button data-slot="button" className={classes} {...props}>{children}</button>
}
