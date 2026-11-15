function withClass(base, className) {
    return className ? `${base} ${className}` : base
}

function Card({className = '', ...props}) {
    return <div data-slot="card" className={withClass('flex flex-col gap-6 rounded-xl border border-[var(--color-line)] bg-white text-[var(--color-ink)] shadow-sm dark:border-slate-700 dark:bg-slate-900', className)} {...props}/>
}

function CardHeader({className = '', ...props}) {
    return <div data-slot="card-header" className={withClass('grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6', className)} {...props}/>
}

function CardTitle({className = '', ...props}) {
    return <h3 data-slot="card-title" className={withClass('font-medium leading-none', className)} {...props}/>
}

function CardDescription({className = '', ...props}) {
    return <p data-slot="card-description" className={withClass('text-sm text-slate-500 dark:text-slate-400', className)} {...props}/>
}

function CardAction({className = '', ...props}) {
    return <div data-slot="card-action" className={withClass('col-start-2 row-span-2 row-start-1 self-start justify-self-end', className)} {...props}/>
}

function CardContent({className = '', ...props}) {
    return <div data-slot="card-content" className={withClass('px-6', className)} {...props}/>
}

function CardFooter({className = '', ...props}) {
    return <div data-slot="card-footer" className={withClass('flex items-center px-6 [.border-t]:pt-6', className)} {...props}/>
}

export {Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent, CardFooter}
